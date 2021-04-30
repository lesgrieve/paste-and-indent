// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

let handle_selection = (editor: vscode.TextEditor, builder: vscode.TextEditorEdit, selection: vscode.Selection, content: string) => {
	let start_line = new vscode.Position(selection.start.line, 0);
    let this_line = new vscode.Selection(start_line, selection.start);
	// Note: this won't work if there are different indent styles
	//       in the pasted code; tab characters.
    let leading_whitespace_regex = (/^\s*$/)
	let line_contents = editor.document.getText(this_line);
    let line_match = line_contents.match(leading_whitespace_regex);
    let line_prefix = '';
    if (line_match && line_match.length > 0) {
        line_prefix = line_match[0];
    }
    let lines = content.split('\n');
    // Find the line with the least amount of initial whitespace and remove
    // that much whitespace from each line; left justify paste.
    let dedent = null
    for (let line of lines) {
        if (line.trim().length > 0) {
            let match = line.match(/^\s*/)
            let leading_whitespace = ''
            if (match != null) {
                leading_whitespace = match[0]
            }
            if (dedent == null || leading_whitespace.length < dedent.length) {
                dedent = leading_whitespace
            }
        }
    }
    if (dedent == null) {
        dedent = ''
    }
    let new_content = lines.shift();
    if (new_content || new_content == '') {
        // remove a last blank line
        // there is almost always going to be a newline that ends up
        // by itself
        if (lines.length > 0 && lines[lines.length - 1].match(leading_whitespace_regex)) {
            lines.pop();
        }
        lines = lines.map(line => { return line_prefix + line.substring(dedent.length); });
        lines.unshift(new_content.substring(dedent.length));
        new_content = lines.join('\n');

        if (new_content) {
            builder.replace(selection, new_content);
        }
    }
};

let paste_and_indent = () => {
	let editor = vscode.window.activeTextEditor;

	if (editor) {
		let myedit = editor;

		vscode.env.clipboard.readText().then(content => {
			myedit.edit((builder: vscode.TextEditorEdit) => {
				myedit.selections.forEach(selection => {
					handle_selection(myedit, builder, selection, content);
				});
			}).then(success => {
				if (success) {
					myedit.selections = myedit.selections.map(selection => {
						return new vscode.Selection(selection.end, selection.end);
					});
				}
			});
        });
	}
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let indent = vscode.commands.registerCommand('extension.paste-and-indent', paste_and_indent);
	context.subscriptions.push(indent);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed

	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World!');
	// });

	// context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
