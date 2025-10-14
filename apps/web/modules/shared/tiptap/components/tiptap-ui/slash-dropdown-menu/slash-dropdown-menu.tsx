"use client";

// --- Hooks ---
import type { SlashMenuConfig } from "@shared/tiptap/components/tiptap-ui/slash-dropdown-menu/use-slash-dropdown-menu";
import { useSlashDropdownMenu } from "@shared/tiptap/components/tiptap-ui/slash-dropdown-menu/use-slash-dropdown-menu";
// --- UI Primitives ---
import {
	Button,
	ButtonGroup,
} from "@shared/tiptap/components/tiptap-ui-primitive/button";
import {
	Card,
	CardBody,
	CardGroupLabel,
	CardItemGroup,
} from "@shared/tiptap/components/tiptap-ui-primitive/card";
import { Separator } from "@shared/tiptap/components/tiptap-ui-primitive/separator";
// --- Tiptap UI ---
import type {
	SuggestionItem,
	SuggestionMenuProps,
	SuggestionMenuRenderProps,
} from "@shared/tiptap/components/tiptap-ui-utils/suggestion-menu";
import {
	filterSuggestionItems,
	SuggestionMenu,
} from "@shared/tiptap/components/tiptap-ui-utils/suggestion-menu";
// --- Lib ---
import { getElementOverflowPosition } from "@shared/tiptap/lib/tiptap-collab-utils";
import * as React from "react";

import "@shared/tiptap/components/tiptap-ui/slash-dropdown-menu/slash-dropdown-menu.scss";
import { ChevronRightIcon } from "@shared/tiptap/components/tiptap-icons/chevron-right-icon";
import { ImageIcon } from "@shared/tiptap/components/tiptap-icons/image-icon";
import { LinkIcon } from "@shared/tiptap/components/tiptap-icons/link-icon";
import { createPortal } from "react-dom";

type SlashDropdownMenuProps = Omit<
	SuggestionMenuProps,
	"items" | "children"
> & {
	config?: SlashMenuConfig;
};

export const SlashDropdownMenu = (props: SlashDropdownMenuProps) => {
	const { config, ...restProps } = props;
	const { getSlashMenuItems } = useSlashDropdownMenu(config);

	return (
		<SuggestionMenu
			char="/"
			pluginKey="slashDropdownMenu"
			decorationClass="tiptap-slash-decoration"
			decorationContent="Filter..."
			selector="tiptap-slash-dropdown-menu"
			items={({ query, editor }) =>
				filterSuggestionItems(getSlashMenuItems(editor), query)
			}
			{...restProps}
		>
			{(props) => <List {...props} config={config} />}
		</SuggestionMenu>
	);
};

// Extended type for submenu support
interface SuggestionItemWithSubmenu extends SuggestionItem {
	hasSubmenu?: boolean;
	submenuItems?: {
		title: string;
		subtext?: string;
		onSelect: (props: { editor: any }) => void;
	}[];
}

const Item = (props: {
	item: SuggestionItemWithSubmenu;
	isSelected: boolean;
	onSelect: () => void;
}) => {
	const { item, isSelected, onSelect } = props;
	const itemRef = React.useRef<HTMLButtonElement>(null);
	const submenuRef = React.useRef<HTMLDivElement>(null);
	const [showSubmenu, setShowSubmenu] = React.useState(false);
	const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

	// Debug logging
	React.useEffect(() => {
		if (item.title === 'Sources') {
			console.log('Sources item rendered:', { 
				hasSubmenu: item.hasSubmenu,
				submenuItems: item.submenuItems,
				showSubmenu
			});
		}
	}, [item, showSubmenu]);

	React.useEffect(() => {
		const selector = document.querySelector(
			'[data-selector="tiptap-slash-dropdown-menu"]',
		) as HTMLElement;
		if (!itemRef.current || !isSelected || !selector) return;

		const overflow = getElementOverflowPosition(itemRef.current, selector);

		if (overflow === "top") {
			itemRef.current.scrollIntoView(true);
		} else if (overflow === "bottom") {
			itemRef.current.scrollIntoView(false);
		}
	}, [isSelected]);

	// Cleanup timeout on unmount
	React.useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const BadgeIcon = item.badge;

	const [submenuPosition, setSubmenuPosition] = React.useState<{ top: number; left: number } | null>(null);

	const showSubmenuWithPosition = () => {
		console.log('showSubmenuWithPosition called:', { 
			hasSubmenu: item.hasSubmenu, 
			submenuItemsLength: item.submenuItems?.length,
			item: item
		});
		
		if (!item.hasSubmenu || !item.submenuItems?.length) return;
		
		const rect = itemRef.current?.getBoundingClientRect();
		if (rect) {
			setSubmenuPosition({
				top: rect.top,
				left: rect.right + 8
			});
			setShowSubmenu(true);
			console.log('Submenu should be visible now');
		}
	};

	const hideSubmenu = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		timeoutRef.current = setTimeout(() => {
			setShowSubmenu(false);
			setSubmenuPosition(null);
		}, 150);
	};

	const cancelHideSubmenu = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
	};

	const handleClick = () => {
		if (item.hasSubmenu && item.submenuItems?.length) {
			showSubmenuWithPosition();
		} else {
			onSelect();
		}
	};

	const handleSubmenuItemClick = (submenuItem: any) => {
		submenuItem.onSelect({ editor: null });
		setShowSubmenu(false);
	};

	const getIconForSourceType = (type: string) => {
		console.log('Getting icon for type:', type, { ImageIcon, LinkIcon });
		switch (type) {
			case 'image':
				return ImageIcon;
			case 'url':
				return LinkIcon;
			default:
				return null;
		}
	};

	return (
		<>
			<Button
				ref={itemRef}
				data-style="ghost"
				data-active-state={isSelected ? "on" : "off"}
				onClick={handleClick}
				onMouseEnter={() => {
					cancelHideSubmenu();
					if (item.hasSubmenu) {
						showSubmenuWithPosition();
					}
				}}
				onMouseLeave={hideSubmenu}
				className="relative w-full justify-start"
			>
				{BadgeIcon && <BadgeIcon className="tiptap-button-icon" />}
				<div className="tiptap-button-text flex-1">{item.title}</div>
				{item.hasSubmenu && (
					<ChevronRightIcon className="h-3 w-3 ml-2 flex-shrink-0" />
				)}
			</Button>

			{/* Submenu using Portal with matching theme */}
			{showSubmenu && submenuPosition && item.submenuItems && createPortal(
				<Card
					className="tiptap-slash-card"
					style={{
						position: 'fixed',
						top: submenuPosition.top,
						left: submenuPosition.left,
						maxHeight: "var(--suggestion-menu-max-height)",
						minWidth: "220px",
						maxWidth: "320px",
						zIndex: 1000,
					}}
					onMouseEnter={cancelHideSubmenu}
					onMouseLeave={hideSubmenu}
				>
					<CardBody className="tiptap-slash-card-body">
						<div className="space-y-1">
							{item.submenuItems.map((submenuItem, index) => {
								const sourceType = (submenuItem as any).sourceType;
								console.log('Rendering submenu item:', submenuItem, 'sourceType:', sourceType);
								
								return (
									<Button
										key={index}
										data-style="ghost"
										onClick={() => handleSubmenuItemClick(submenuItem)}
										className="w-full justify-start gap-3 px-3 py-2"
									>
										{sourceType === 'image' && <ImageIcon className="tiptap-button-icon flex-shrink-0" />}
										{sourceType === 'url' && <LinkIcon className="tiptap-button-icon flex-shrink-0" />}
										<div className="tiptap-button-text flex-1 text-left">
											{submenuItem.title}
										</div>
									</Button>
								);
							})}
						</div>
					</CardBody>
				</Card>,
				document.body
			)}
		</>
	);
};

const List = ({
	items,
	selectedIndex,
	onSelect,
	config,
}: SuggestionMenuRenderProps & { config?: SlashMenuConfig }) => {
	const renderedItems = React.useMemo(() => {
		const rendered: React.ReactElement[] = [];
		const showGroups = config?.showGroups !== false;

		if (!showGroups) {
			items.forEach((item, index) => {
				rendered.push(
					<Item
						key={`item-${index}-${item.title}`}
						item={item}
						isSelected={index === selectedIndex}
						onSelect={() => onSelect(item)}
					/>,
				);
			});
			return rendered;
		}

		const groups: {
			[groupLabel: string]: {
				items: SuggestionItem[];
				indices: number[];
			};
		} = {};

		items.forEach((item, index) => {
			const groupLabel = item.group || "";
			if (!groups[groupLabel]) {
				groups[groupLabel] = { items: [], indices: [] };
			}
			groups[groupLabel].items.push(item);
			groups[groupLabel].indices.push(index);
		});

		Object.entries(groups).forEach(
			([groupLabel, groupData], groupIndex) => {
				if (groupIndex > 0) {
					rendered.push(
						<Separator
							key={`separator-${groupIndex}`}
							orientation="horizontal"
						/>,
					);
				}

				const groupItems = groupData.items.map((item, itemIndex) => {
					const originalIndex = groupData.indices[itemIndex];
					return (
						<Item
							key={`item-${originalIndex}-${item.title}`}
							item={item}
							isSelected={originalIndex === selectedIndex}
							onSelect={() => onSelect(item)}
						/>
					);
				});

				if (groupLabel) {
					rendered.push(
						<CardItemGroup
							key={`group-${groupIndex}-${groupLabel}`}
						>
							<CardGroupLabel>{groupLabel}</CardGroupLabel>
							<ButtonGroup>{groupItems}</ButtonGroup>
						</CardItemGroup>,
					);
				} else {
					rendered.push(...groupItems);
				}
			},
		);

		return rendered;
	}, [items, selectedIndex, onSelect, config?.showGroups]);

	if (!renderedItems.length) {
		return null;
	}

	return (
		<Card
			className="tiptap-slash-card"
			style={{
				maxHeight: "var(--suggestion-menu-max-height)",
			}}
		>
			<CardBody className="tiptap-slash-card-body">
				{renderedItems}
			</CardBody>
		</Card>
	);
};
