import { App, PluginSettingTab, Setting, SettingDefinitionItem } from 'obsidian';
import PinnedTabsRowPlugin from './main';

export interface PinnedTabsRowSettings {
	enabled: boolean;
	compactPinned: boolean;
}

export const DEFAULT_SETTINGS: PinnedTabsRowSettings = {
	enabled: true,
	compactPinned: false,
};

export class PinnedTabsRowSettingTab extends PluginSettingTab {
	plugin: PinnedTabsRowPlugin;

	constructor(app: App, plugin: PinnedTabsRowPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private applySettings(): void {
		this.plugin.pinnedTabsRow.applySettings(this.plugin.settings);
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
						this.applySettings();
					}),
			);

		new Setting(containerEl)
			.setName('Compact pinned tabs')
			.setDesc('Show pinned tabs as an icon-only strip.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.compactPinned)
					.onChange(async (value) => {
						this.plugin.settings.compactPinned = value;
						await this.plugin.saveSettings();
						this.applySettings();
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
			{
				name: 'Compact pinned tabs',
				desc: 'Show pinned tabs as an icon-only strip.',
				control: {
					type: 'toggle',
					key: 'compactPinned',
				},
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		await super.setControlValue(key, value);
		if (key === 'enabled' || key === 'compactPinned') {
			this.applySettings();
		}
	}
}