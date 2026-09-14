import { Notice, Plugin } from 'obsidian';
import { PinnedTabsRowSettings } from './settings';

export const ENABLED_CLASS = 'pinned-tabs-row-enabled';
export const COMPACT_CLASS = 'pinned-tabs-row-compact';

const TAB_HEADER_SELECTOR = '.workspace-tab-header';
const PINNED_ICON_SELECTOR = '.workspace-tab-header-status-icon.mod-pinned';

/**
 * The plugin is CSS-only: it toggles body classes and styles.css does the
 * layout (CSS grid: pinned tabs row 1, divider row 2, unpinned row 3).
 * No DOM manipulation, so Obsidian's updateTabDisplay cannot interfere.
 */
export class PinnedTabsRowManager {
	constructor(_plugin: Plugin) {}

	applySettings(settings: PinnedTabsRowSettings): void {
		const body = activeDocument.body;
		body.toggleClass(ENABLED_CLASS, settings.enabled);
		body.toggleClass(COMPACT_CLASS, settings.compactPinned);
	}

	destroy(): void {
		const body = activeDocument.body;
		body.removeClass(ENABLED_CLASS);
		body.removeClass(COMPACT_CLASS);
	}

	/** Reports what the plugin currently sees, for debugging. */
	debug(): void {
		const containers = activeDocument.querySelectorAll<HTMLElement>(
			`.workspace-tab-header-container-inner`,
		);
		let pinned = 0;
		containers.forEach((container) => {
			pinned += container.querySelectorAll(
				`:scope > ${TAB_HEADER_SELECTOR} ${PINNED_ICON_SELECTOR}`,
			).length;
		});
		new Notice(
			`Pinned tabs row: ${containers.length} tab bar(s), ${pinned} pinned tab(s)`,
		);
	}
}