import { App, Notice, Plugin } from 'obsidian';

export const PINNED_ROW_CLASS = 'pinned-tabs-row';

const TAB_HEADER_SELECTOR = '.workspace-tab-header';
const TAB_CONTAINER_SELECTOR = '.workspace-tab-header-container-inner';
const PINNED_ICON_SELECTOR = '.workspace-tab-header-status-icon.mod-pinned';

const RESYNC_INTERVAL_MS = 1000;

/**
 * Keeps a separator element inside each tab bar. Pinned and unpinned tabs
 * stay as direct children of the tab bar (Obsidian removes any tab header
 * that is re-parented elsewhere), and the CSS-only layout in styles.css
 * splits them into two rows via flexbox `order` + the separator's 100%
 * flex-basis line break.
 */
export class PinnedTabsRowManager {
	private app: App;
	private plugin: Plugin;
	private enabled = false;
	private observers: MutationObserver[] = [];
	private rafId: number | null = null;
	private intervalId: number | null = null;

	constructor(plugin: Plugin) {
		this.app = plugin.app;
		this.plugin = plugin;
	}

	/** Must be called once from the plugin's onload. */
	start(): void {
		this.app.workspace.onLayoutReady(() => {
			this.sync();
			this.observeAll();
		});
		this.plugin.registerEvent(
			this.app.workspace.on('layout-change', this.onLayoutChange),
		);
	}

	setEnabled(enabled: boolean): void {
		this.enabled = enabled;
		if (enabled) {
			this.sync();
			this.observeAll();
			this.startInterval();
		} else {
			this.disconnectObservers();
			this.stopInterval();
			this.removeRows();
		}
	}

	destroy(): void {
		this.disconnectObservers();
		this.stopInterval();
		if (this.rafId !== null) {
			window.cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
		this.removeRows();
	}

	/** Reports what the plugin currently sees, for debugging. */
	debug(): void {
		const containers =
			activeDocument.querySelectorAll<HTMLElement>(TAB_CONTAINER_SELECTOR);
		let pinned = 0;
		const lines: string[] = [];
		containers.forEach((container) => {
			const pinnedHeaders = Array.from(
				container.querySelectorAll<HTMLElement>(
					`:scope > ${TAB_HEADER_SELECTOR} ${PINNED_ICON_SELECTOR}`,
				),
			);
			pinned += pinnedHeaders.length;
			const spacer = container.querySelector(
				`:scope > .${PINNED_ROW_CLASS}`,
			);
			const style = activeDocument.defaultView
				? activeDocument.defaultView.getComputedStyle(container)
				: null;
			lines.push(
				`bar: ${container.children.length} children, flexWrap=${
					style?.flexWrap ?? '?'
				}, spacer=${spacer ? 'yes' : 'no'}, pinned=${pinnedHeaders.length}${
					pinnedHeaders[0]
						? `, order=${activeDocument.defaultView?.getComputedStyle(pinnedHeaders[0]).order ?? '?'}`
						: ''
				}`,
			);
		});
		new Notice(
			`Pinned Tabs Row: ${containers.length} bar(s), ${pinned} pinned\n${lines.join('\n')}`,
		);
	}

	private onLayoutChange = (): void => {
		this.observeAll();
		this.scheduleSync();
	};

	private scheduleSync(): void {
		if (!this.enabled || this.rafId !== null) return;
		this.rafId = window.requestAnimationFrame(() => {
			this.rafId = null;
			this.sync();
		});
	}

	private startInterval(): void {
		if (this.intervalId !== null) return;
		this.intervalId = window.setInterval(() => this.sync(), RESYNC_INTERVAL_MS);
	}

	private stopInterval(): void {
		if (this.intervalId !== null) {
			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	private observeAll(): void {
		this.disconnectObservers();
		if (!this.enabled) return;
		activeDocument
			.querySelectorAll<HTMLElement>(TAB_CONTAINER_SELECTOR)
			.forEach((container) => {
				const observer = new MutationObserver(() => this.scheduleSync());
				observer.observe(container, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ['class'],
				});
				this.observers.push(observer);
			});
	}

	private disconnectObservers(): void {
		this.observers.forEach((observer) => observer.disconnect());
		this.observers = [];
	}

	private removeRows(): void {
		activeDocument
			.querySelectorAll(`.${PINNED_ROW_CLASS}`)
			.forEach((el) => el.remove());
	}

	private sync(): void {
		if (!this.enabled) return;
		activeDocument
			.querySelectorAll<HTMLElement>(TAB_CONTAINER_SELECTOR)
			.forEach((container) => {
				if (
					container.querySelector(
						`:scope > ${TAB_HEADER_SELECTOR} ${PINNED_ICON_SELECTOR}`,
					) === null
				) {
					return;
				}
				if (
					container.querySelector(`:scope > .${PINNED_ROW_CLASS}`) ===
					null
				) {
					container.appendChild(createDiv({ cls: PINNED_ROW_CLASS }));
				}
			});
	}
}