// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
    const vscode = acquireVsCodeApi();

    // Request initial config
    vscode.postMessage({ command: 'getInitialConfig' });

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The JSON data our extension sent
        switch (message.command) {
            case 'init':
                initConfigForm(message.data);
                break;
        }
    });

    function initConfigForm(config) {
        console.log("Initializing config form with:", config);
        for (const key in config) {
            const configItem = config[key];
            const input = document.getElementById(key);
            if (input) {
                console.log("Found input for key:", key, "value:", configItem.currentValue);
                input.value = configItem.currentValue;
            } else {
                console.log("Input not found for key:", key);
            }
        }
    }

    const saveButton = document.getElementById('save-config');
    saveButton.addEventListener('click', () => {
        const updatedConfig = {};
        updatedConfig["llm.url"] = document.getElementById("llm.url").value;
        updatedConfig["llm.model"] = document.getElementById("llm.model").value;
        updatedConfig["llm.temperature"] = document.getElementById("llm.temperature").value;
        updatedConfig["llm.maxTokens"] = document.getElementById("llm.maxTokens").value;

        vscode.postMessage({
            command: 'updateConfig',
            data: updatedConfig,
        });
    });
}());