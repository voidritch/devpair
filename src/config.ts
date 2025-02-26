import * as vscode from 'vscode';

export function getConfig(): DevPairConfig {
    const vscodeConfig = vscode.workspace.getConfiguration('devpair');
    console.log(vscodeConfig);
    return {
        "llm.url": {
            "type": "string",
            "description": "URL of your LLM server.",
            "currentValue": vscodeConfig.get<string>('llm.url') ?? 'localhost:1222'
        },
        "llm.model": {
            "type": "string",
            "description": "The Ollama model to use for code completion.",
            "currentValue": vscodeConfig.get<string>('llm.model') ?? ''
        },
        "llm.temperature": {
            "type": "number",
            "description": "The temperature to use for code completion (0-1).",
            "currentValue": vscodeConfig.get<number>('llm.temperature') ?? 0.5
        },
        "llm.maxTokens": {
            "type": "number",
            "description": "The maximum number of tokens to generate for code completion.",
            "currentValue": vscodeConfig.get<number>('llm.maxTokens') ?? 100
        }
    };
}

export async function updateConfig(config: any) {
    const vscodeConfig = vscode.workspace.getConfiguration('devpair');
    console.log(vscodeConfig);
    try {
        for (const key in config) {
            await vscodeConfig.update(key, config[key], vscode.ConfigurationTarget.Global);
        }
        vscode.window.showInformationMessage('DevPair configuration updated.');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to update configuration: ${error}`);
    }
}

export interface DevPairConfig {
    "llm.url": ConfigProperty<string>;
    "llm.model": ConfigProperty<string>;
    "llm.temperature": ConfigProperty<number>;
    "llm.maxTokens": ConfigProperty<number>;
}

interface ConfigProperty<T> {
    type: string;
    description: string;
    currentValue: T | undefined;
}
