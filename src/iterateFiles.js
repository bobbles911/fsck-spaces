import {opendir, stat} from "node:fs/promises";
import {join, extname} from "node:path";

export default async function* iterateFiles(absPath, fileTypes, excludeDirs) {
	try {
		const pathStat = await stat(absPath);

		if (pathStat.isFile()) {
			yield absPath;
			return;
		}

		const dir = await opendir(absPath);

		for await (const dirent of dir) {
			if (dirent.isDirectory()
				&& !excludeDirs.includes(dirent.name)
				&& dirent.name[0] != "." // Also exclude hidden directories
			) {
				yield* iterateFiles(join(absPath, dirent.name), fileTypes, excludeDirs);
			} else {
				if (fileTypes.includes(extname(dirent.name).slice(1))) {
					yield join(absPath, dirent.name);
				}
			}
		}
	} catch (error) {
		console.error(error);
	}
}
