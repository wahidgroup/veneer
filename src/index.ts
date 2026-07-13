/**
 * @packageDocumentation
 * `@wahidgroup/veneer`: React component library for Wahid Group apps.
 *
 * Styling: CVA variants + `cn` (`clsx` + `tailwind-merge`). Import
 * `@wahidgroup/veneer/theme.css` in the consumer Tailwind entry and
 * ensure `@source` covers this package's `dist`.
 */

export { ActionMenu } from "./components/overlays/ActionMenu.js";
export type {
	ActionMenuDivider,
	ActionMenuEntry,
	ActionMenuItem,
	ActionMenuProps,
} from "./components/overlays/ActionMenu.js";
export { Alert, alertVariants } from "./components/feedback/Alert.js";
export type { AlertProps, AlertType } from "./components/feedback/Alert.js";
export { AppShell } from "./components/layout/AppShell.js";
export type {
	AppShellProps,
	AppShellViewport,
} from "./components/layout/AppShell.js";
export {
	APP_SHELL_COMPACT_QUERY,
	APP_SHELL_MOBILE_MAX_PX,
	APP_SHELL_MOBILE_QUERY,
	APP_SHELL_TABLET_MAX_PX,
	resolveAppShellViewport,
} from "./components/layout/AppShell.js";
export { Badge, badgeVariants } from "./components/indicators/Badge.js";
export type { BadgeProps } from "./components/indicators/Badge.js";
export { Breadcrumbs } from "./components/navigation/Breadcrumbs.js";
export type {
	BreadcrumbItem,
	BreadcrumbLinkRenderProps,
	BreadcrumbsProps,
} from "./components/navigation/Breadcrumbs.js";
export { Button, buttonVariants } from "./components/forms/Button.js";
export type { ButtonProps } from "./components/forms/Button.js";
export { Checkbox } from "./components/forms/Checkbox.js";
export type { CheckboxProps } from "./components/forms/Checkbox.js";
export { Combobox } from "./components/forms/Combobox.js";
export type {
	ComboboxMultiProps,
	ComboboxOption,
	ComboboxProps,
	ComboboxSingleProps,
} from "./components/forms/Combobox.js";
export { ConfirmDialog } from "./components/overlays/ConfirmDialog.js";
export type { ConfirmDialogProps } from "./components/overlays/ConfirmDialog.js";
export { DateTimePicker } from "./components/forms/DateTimePicker.js";
export type { DateTimePickerProps } from "./components/forms/DateTimePicker.js";
export {
	DataTable,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	buildDefaultQuery,
} from "./components/data/DataTable.js";
export type {
	DataTableColumn,
	DataTableColumnFilter,
	DataTableColumnMeta,
	DataTableProps,
	DataTableQuery,
	DataTableRowSelection,
	DataTableSort,
} from "./components/data/DataTable.js";
export { applyRowTransaction } from "./components/data/applyRowTransaction.js";
export type { RowTransaction } from "./components/data/applyRowTransaction.js";
export { useDataTableRows } from "./components/data/useDataTableRows.js";
export { FieldError } from "./components/forms/FieldError.js";
export type { FieldErrorProps } from "./components/forms/FieldError.js";
export { FieldHint } from "./components/forms/FieldHint.js";
export type { FieldHintProps } from "./components/forms/FieldHint.js";
export { FileUpload } from "./components/forms/FileUpload.js";
export type { FileUploadProps } from "./components/forms/FileUpload.js";
export { FormField, controlVariants } from "./components/forms/FormField.js";
export type {
	ControlVariantProps,
	FormFieldProps,
} from "./components/forms/FormField.js";
export { FormSection } from "./components/forms/FormSection.js";
export type { FormSectionProps } from "./components/forms/FormSection.js";
export { Input } from "./components/forms/Input.js";
export type { InputProps } from "./components/forms/Input.js";
export { Label } from "./components/forms/Label.js";
export type { LabelProps } from "./components/forms/Label.js";
export { Loading, loadingVariants } from "./components/feedback/Loading.js";
export type {
	LoadingProps,
	LoadingVariant,
} from "./components/feedback/Loading.js";
export { Modal } from "./components/overlays/Modal.js";
export type { ModalProps } from "./components/overlays/Modal.js";
export { NumberInput } from "./components/forms/NumberInput.js";
export type { NumberInputProps } from "./components/forms/NumberInput.js";
export { Portal } from "./components/overlays/Portal.js";
export type { PortalProps } from "./components/overlays/Portal.js";
export { RadioGroup } from "./components/forms/RadioGroup.js";
export type {
	RadioGroupProps,
	RadioOption,
} from "./components/forms/RadioGroup.js";
export { SearchInput } from "./components/forms/SearchInput.js";
export type { SearchInputProps } from "./components/forms/SearchInput.js";
export { Select } from "./components/forms/Select.js";
export type { SelectOption, SelectProps } from "./components/forms/Select.js";
export { SideNav } from "./components/navigation/SideNav.js";
export type {
	SideNavItem,
	SideNavLinkRenderProps,
	SideNavProps,
} from "./components/navigation/SideNav.js";
export { Slider } from "./components/forms/Slider.js";
export type { SliderProps } from "./components/forms/Slider.js";
export {
	Tabs,
	TabsList,
	TabsPanel,
	TabsTrigger,
} from "./components/navigation/Tabs.js";
export type {
	TabsListProps,
	TabsPanelProps,
	TabsProps,
	TabsTriggerProps,
} from "./components/navigation/Tabs.js";
export { TagInput } from "./components/forms/TagInput.js";
export type { TagInputProps } from "./components/forms/TagInput.js";
export { TextArea } from "./components/forms/TextArea.js";
export type { TextAreaProps } from "./components/forms/TextArea.js";
export { Toggle } from "./components/forms/Toggle.js";
export type { ToggleProps } from "./components/forms/Toggle.js";
export {
	Toast,
	ToastViewport,
	toastVariants,
} from "./components/feedback/Toast.js";
export type {
	ToastAction,
	ToastFade,
	ToastFadeConfig,
	ToastPlacement,
	ToastPosition,
	ToastProps,
	ToastType,
	ToastViewportProps,
} from "./components/feedback/Toast.js";
export { Tooltip } from "./components/overlays/Tooltip.js";
export type { TooltipProps } from "./components/overlays/Tooltip.js";
export { TopNav } from "./components/navigation/TopNav.js";
export type { TopNavProps } from "./components/navigation/TopNav.js";
export { useDebounce } from "./hooks/useDebounce.js";
export { cn, cva } from "./utils/index.js";
export type { VariantProps } from "./utils/index.js";
