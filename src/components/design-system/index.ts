/**
 * ============================================================================
 * Akasha Portal — Design System barrel
 * ============================================================================
 * Single import path for the 8 base components + tokens.
 *
 *   import {
 *     Button, Card, Input, Badge, Divider, Loading, Empty, Error,
 *     tokens, semanticColor,
 *   } from '@/components/design-system';
 *
 * Each component is also exported individually from
 * `@/components/design-system/<name>` for tree-shaking & IDE navigation.
 * ============================================================================
 */

// --- Components -------------------------------------------------------------
export { Button, buttonVariants } from './button';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './card';
export { Input } from './input';
export { Badge, badgeVariants } from './badge';
export { Divider } from './divider';
export { Loading } from './loading';
export { Empty } from './empty';
export { Error } from './error';
// Wave 17 — state systems (empty, error, loading)
export {
  Skeleton,
  PostCardSkeleton,
  ArticleCardSkeleton,
  CommentSkeleton,
  GroupCardSkeleton,
  NotificationItemSkeleton,
} from './skeleton';
export {
  EmptyIllustration,
  EmptyScreen,
} from './empty-illustrations';
export {
  NotFound,
  ServerError,
  OfflineIndicator,
  FieldError,
  FormErrorBanner,
  ApiError,
  EmptyResults,
} from './error-states';
export {
  ProgressBar,
  IndeterminateProgress,
  SectionLoading,
  PageLoading,
  ContentTransition,
  DotsLoader,
} from './loading-states';

// --- Types -----------------------------------------------------------------
export type { ButtonProps } from '@base-ui/react/button';
export type { VariantProps } from 'class-variance-authority';
export type { DividerProps, Orientation, Variant as DividerVariant, Thickness as DividerThickness } from './divider';
export type { LoadingProps, LoadingVariant, LoadingSize } from './loading';
export type { EmptyProps, EmptyAction, EmptySize, EmptyVariant } from './empty';
export type { ErrorProps, ErrorSeverity } from './error';
export type {
  SkeletonProps,
  SkeletonVariant,
  SkeletonSize,
} from './skeleton';
export type {
  EmptyIllustrationProps,
  EmptyScreenProps,
} from './empty-illustrations';
export type {
  NotFoundProps,
  ServerErrorProps,
  OfflineIndicatorProps,
  FieldErrorProps,
  FormErrorBannerProps,
  ApiErrorProps,
  EmptyResultsProps,
} from './error-states';
export type {
  ProgressBarProps,
  SectionLoadingProps,
  PageLoadingProps,
  ContentTransitionProps,
} from './loading-states';

// --- Tokens ----------------------------------------------------------------
export {
  tokens,
  palette,
  spacing,
  fontFamily,
  fontSize,
  fontWeight,
  radius,
  shadows,
  duration,
  easing,
  breakpoints,
  zIndex,
  semanticColor,
  components,
} from '@/lib/design-system/tokens';
export type { Tokens, Palette, SemanticColor } from '@/lib/design-system/tokens';
