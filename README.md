# fsck-spaces

*fsck spaces* is a tool for finding and fixing a common error found in programming source code: The use of spaces for indentation.

These errors are found and recursively replaced with the correct usage of tabs.

By default, the following list of file extensions will be fixed: `js, ts, jsx, tsx, json, css`, as the scourge appears to most prevalently afflict those files used by web developers.

To add to this list you can call `fsck-spaces --more=cpp,h,whatever` 

## Installation

`npm install -g fsck-spaces`

## Usage

| Command | Description |
| --- | --- |
| `fsck-spaces` | Recurse and replace in the current directory. |
| `fsck-spaces ./some-path` | Run at some other path. |
| `fsck-spaces --more=other,file,extensions` | Add to the built in list. |
| `fsck-spaces --no=some_dir,other_dir` | Exclude some directories. `node_modules` is excluded by default. |
| `fsck-spaces --dry-run` | 😳️ just list the files which would be modified. |