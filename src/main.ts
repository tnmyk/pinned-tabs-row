import { Notice, Plugin, WorkspaceLeaf } from 'obsidian';
import { PinnedTabsRowManager } from './pinnedTabsRow';
import {
	DEFAULT_SETTINGS,
	PinnedTabsRowSettings,
	PinnedTabsRowSettingTab,
} from './settings';

export default class PinnedTabsRowPlugin extends Plugin {
	settings!: PinnedTabsRowSettings;
	pinnedTabsRow!: PinnedTabsRowManager;

	async onload() {
		await this.loadSettings();

		this.pinnedTabsRow = new PinnedTabsRowManager(this);
		this.pinnedTabsRow.applySettings(this.settings);

		this.app.workspace.onLayoutReady(() => {
			new Notice('Pinned tabs row loaded');
		});

		this.addCommand({
			id: 'toggle-pin-current-tab',
			name: 'Pin or unpin current tab',
			callback: () => {
				const leaf = this.app.workspace.getLeaf(false);
				if (leaf) leaf.togglePinned();
			},
		});
		this.addCommand({
			id: 'unpin-all-tabs',
			name: 'Unpin all tabs',
			callback: () => {
				const workspace = this.app.workspace as unknown as {
					getLeaves(): WorkspaceLeaf[];
				};
				workspace.getLeaves().forEach((leaf) => {
					if (leaf.getViewState().pinned) leaf.setPinned(false);
				});
			},
		});
		this.addCommand({
			id: 'debug-tab-row',
			name: 'Debug tab row',
			callback: () => {
				this.pinnedTabsRow.debug();
			},
		});

		this.addSettingTab(new PinnedTabsRowSettingTab(this.app, this));
	}

	onunload() {
		this.pinnedTabsRow.destroy();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<PinnedTabsRowSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}