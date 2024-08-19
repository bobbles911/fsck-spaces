import {readFile, writeFile} from "node:fs/promises";

function countPrecedingSpaces(str) {
	const match = str.match(/^ */);
	return match ? match[0].length : 0;
}

function replaceSpacesInLine(line, tabSize) {
	const spaceCount = countPrecedingSpaces(line);
	const tabCount = Math.ceil(spaceCount / tabSize);
	return "\t".repeat(tabCount) + line.replace(/^ */, "");
}

function replaceSpaces(sourceStr) {
	// Default to unmodified
	let result = sourceStr;

	const lines = sourceStr.split(/(?<=\r?\n)/);
	const spaceCounts = lines.map(line => countPrecedingSpaces(line));
	const spaceDifferenceTallies = {};

	// Default to the length of the first line whitespace, in case there are no other lines...
	let detectedTabSize = spaceCounts[0];

	for (let i = 1; i < lines.length; i ++) {
		// Space indentation difference between current and prev lines
		const spaceDifference = Math.abs(spaceCounts[i] - spaceCounts[i-1]);

		if (spaceDifference > 0) {
			spaceDifferenceTallies[spaceDifference] = (spaceDifferenceTallies[spaceDifference] ?? 0) + 1;
		}
	}

	const spaceDifferenceTalliesArray = Object.entries(spaceDifferenceTallies);

	if (spaceDifferenceTalliesArray.length > 0) {
		const biggestTally = spaceDifferenceTalliesArray.reduce((acc, curr) => curr[1] > acc[1] ? curr : acc, spaceDifferenceTalliesArray[0])[0];
		detectedTabSize = biggestTally;
	}

	// Replace the spaces!
	if (detectedTabSize > 0) {
		result = lines.map(line => replaceSpacesInLine(line, detectedTabSize)).join("");
	}

	return {
		result,
		detectedTabSize,
		modifiedFile : detectedTabSize > 0
	};
}

export default async function processFiles(filesIterator, dryRun = true) {
	let fileModifiedCount = 0;

	for await (const filePath of filesIterator) {
		const {result, detectedTabSize, modifiedFile} = replaceSpaces(
			await readFile(filePath, {encoding : "utf-8"})
		);

		if (modifiedFile) {
			fileModifiedCount ++;
			console.log(`Replaced spaces with tab size ${detectedTabSize} in file ${filePath}`);
		} else {
			console.log(`No spaces found in file ${filePath}`);
		}

		if (!dryRun) {
			await writeFile(filePath, result);
		}
	}

	console.log(`Replaced spaces in ${fileModifiedCount} file(s).`);
}
