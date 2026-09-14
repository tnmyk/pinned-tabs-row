import { App, PluginSettingTab, Setting } from 'obsidian';
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
						this.plugin.pinnedTabsRow.applySettings(this.plugin.settings);
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
						this.plugin.pinnedTabsRow.applySettings(this.plugin.settings);
					}),
			);
	}
}