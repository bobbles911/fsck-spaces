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
	if (sourceStr.length == 0) {
		return "";
	}

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

	//console.log("spaceDifferenceTallies", spaceDifferenceTallies);
	//console.log(lines.slice(0, 10));

	const spaceDifferenceTalliesArray = Object.entries(spaceDifferenceTallies);

	if (spaceDifferenceTalliesArray.length > 0) {
		const biggestTally = spaceDifferenceTalliesArray.reduce((acc, curr) => curr[1] > acc[1] ? curr : acc, spaceDifferenceTalliesArray[0])[0];
		//console.log("Biggest tally", biggestTally);
		detectedTabSize = biggestTally;
	}

	console.log("Detected tab size as", detectedTabSize);

	if (detectedTabSize > 0) {
		//console.log(sourceStr.slice(0, 200));
		return lines.map(line => replaceSpacesInLine(line, detectedTabSize)).join("");
	}

	// Return unmodified
	return sourceStr;
}

export default async function processFiles(filesIterator, dryRun = true) {
	for await (const filePath of filesIterator) {
		console.log("Replacing in file", filePath);

		const result = replaceSpaces(
			await readFile(filePath, {encoding : "utf-8"})
		);

		if (!dryRun) {
			await writeFile(filePath, result);
		}
	}
}
