import { App, PluginSettingTab, Setting, SettingDefinitionItem } from 'obsidian';
import PinnedTabsRowPlugin from './main';

export interface PinnedTabsRowSettings {
	enabled: boolean;
}

export const DEFAULT_SETTINGS: PinnedTabsRowSettings = {
	enabled: true,
};

export class PinnedTabsRowSettingTab extends PluginSettingTab {
	plugin: PinnedTabsRowPlugin;

	constructor(app: App, plugin: PinnedTabsRowPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Pinned tabs row')
			.setDesc('Show pinned tabs in a separate row above the tab bar.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enabled)
					.onChange(async (value) => {
						this.plugin.settings.enabled = value;
						await this.plugin.saveSettings();
						this.plugin.pinnedTabsRow.setEnabled(value);
					}),
			);
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'Pinned tabs row',
				desc: 'Show pinned tabs in a separate row above the tab bar.',
				control: {
					type: 'toggle',
					key: 'enabled',
				},
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		await super.setControlValue(key, value);
		if (key === 'enabled') {
			this.plugin.pinnedTabsRow.setEnabled(Boolean(value));
		}
	}
}