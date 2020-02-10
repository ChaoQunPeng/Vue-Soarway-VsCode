import * as vscode from 'vscode';
import path = require('path');
import fs = require('fs');

export function activate(context: vscode.ExtensionContext) {

	let componentFlatDisposable = vscode.commands.registerCommand('extension.componentFlatDisposable', (uri) => {
		generateCommand(uri, 'component-flat');
	});

	let componentDisposable = vscode.commands.registerCommand('extension.componentDisposable', (uri) => {
		generateCommand(uri, 'component');
	});

	context.subscriptions.push(componentFlatDisposable, componentDisposable);
}


export function generateCommand(uri: any, type?: string) {

	const currentPath = uri.fsPath;
	const stats = fs.statSync(currentPath);

	let parentPath: string = "";

	if (stats.isDirectory()) parentPath = currentPath;
	if (stats.isFile()) parentPath = path.dirname(currentPath);
	const folderPath = parentPath;

	// const fileFolderName = getFolderName(folderPath, "\\");
	vscode.window.showInputBox({
		placeHolder: "请输入组件名称"
	}).then(fileName => {
		// fileName may be is undefined,No input fileName
		if (!fileName) return;
		if (type == 'component-flat') {
			generateTsFile(folderPath, fileName as string);
			generateVueFile(folderPath, fileName as string);
		}
		else if (type == 'component') {
			const inculdeFolderPath = folderPath + `/${fileName}`;
			const hasFolderPath = fs.existsSync(inculdeFolderPath);
			if (hasFolderPath) {
				vscode.window.showWarningMessage(`${fileName} 文件夹已存在！`);
			} else {
				fs.mkdir(inculdeFolderPath, {}, (err => {
					if (err) throw err;

					generateTsFile(inculdeFolderPath, fileName as string);
					generateVueFile(inculdeFolderPath, fileName as string);

				}))
			}
		}
	})

}

/**
 * 生成.ts
 */
export function generateTsFile(folderPath: string, fileName: string) {
	const filePath = path.join(folderPath, `${fileName}.ts`);

	fs.exists(filePath, (res) => {
		if (res) {
			vscode.window.showErrorMessage(`已存在${fileName}.ts！`);
			return;
		}

		const content = `import Vue from 'vue';

/**
 * ${fileName} 
 */
export default Vue.extend({

	data () {
		return {
		 
		};
	},
	methods: {

	},
	mounted () {

	},
	created () {

	}
});`;


		fs.writeFile(filePath, content, (error) => {
			if (error) {
				vscode.window.showInformationMessage(error.message);
				return;
			}
			vscode.window.showInformationMessage(`创建${fileName}.ts成功!`);
		});
	})
}

/**
 * 生成.ts
 */
export function generateVueFile(folderPath: string, fileName: string) {
	const filePath = path.join(folderPath, `${fileName}.vue`);

	fs.exists(filePath, (res) => {
		if (res) {
			vscode.window.showErrorMessage(`已存在${fileName}.vue！`);
			return;
		}

		const content = `<template>
		<div>${fileName} 组件生成成功！</div>
</template>
	
<script lang="ts" src="./${fileName}.ts"></script>

<style lang="less">

</style>
			
				`;

		fs.writeFile(filePath, content, (error) => {
			if (error) {
				vscode.window.showInformationMessage(error.message);
				return;
			}
			vscode.window.showInformationMessage(`创建${fileName}.vue成功!`);
		});
	})
}

export function deactivate() { }

/**
 * 获取文件夹名称
 */
function getFolderName(path: string, split: string) {
	let strArr = path.split(split)
	let res = strArr[strArr.length - 1] != "" ? strArr[strArr.length - 1] : strArr[strArr.length - 2]
	return res;
}