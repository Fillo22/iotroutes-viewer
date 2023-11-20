import * as vscode from 'vscode';
import { EdgeRoutesViewerProvider } from './EdgeRoutesViewerProvider';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(EdgeRoutesViewerProvider.register(context));
}

