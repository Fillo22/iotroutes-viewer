import * as vscode from 'vscode';
import { join } from 'path';
import { promises as fs } from 'fs';

export class EdgeRoutesViewerProvider
  implements vscode.CustomTextEditorProvider
{
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new EdgeRoutesViewerProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      EdgeRoutesViewerProvider.viewType,
      provider
    );
    return providerRegistration;
  }

  private static readonly viewType = 'iotedge-routes.viewer';

  constructor(private readonly context: vscode.ExtensionContext) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(join(this.context.extensionPath, 'media')),
      ],
    };
    
    //vscode.workspace.openTextDocument());
    const index = join(this.context.extensionPath, 'media/index.html');

    const matchLinks = /(href|src)="([^"]*)"/g;
    const toUri = (_, prefix: 'href' | 'src', link: string) => {
      // For <base href="#" />
      if (link === '#') {
        return `${prefix}="${link}"`;
      }
      // For scripts & links
      const uri = webviewPanel.webview.asWebviewUri(vscode.Uri.joinPath(
        this.context.extensionUri, 'media', link));
      return `${prefix}="${uri}"`;
    };

    webviewPanel.webview.onDidReceiveMessage(e => {
      switch (e.type) {
				case 'ready':
          console.log('===> ready');
          updateWebview();
					return;
      }
    });

    fs.readFile(index, 'utf-8')
        .then((html) => {;
            webviewPanel.webview.html = html.replace(matchLinks, toUri);
        });

    function updateWebview() {
      console.log('updateWebview ==>>>>', document.getText().substring(0, 100));
      webviewPanel.webview.postMessage({
        type: 'update',
        text: document.getText(),
      });
    }

    // Hook up event handlers so that we can synchronize the webview with the text document.
    //
    // The text document acts as our model, so we have to sync change in the document to our
    // editor and sync changes in the editor back to the document.
    //
    // Remember that a single text document can also be shared between multiple custom
    // editors (this happens for example when you split a custom editor)

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.uri.toString() === document.uri.toString()) {
          updateWebview();
        }
      }
    );

    // Make sure we get rid of the listener when our editor is closed.
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

  }

  
}
