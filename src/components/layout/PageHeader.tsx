import { cn } from "@/lib/utils";
import { Heading } from "@/components/design-system/Typography";
import { MysticDivider } from "@/components/shared/MysticDivider";
import Link from "next/link";

/**
 * Breadcrumb item for navigation
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * PageHeader props
 */
export interface PageHeaderProps {
  /** Main title */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional breadcrumb navigation */
  breadcrumb?: BreadcrumbItem[];
  /** Optional actions slot on the right */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PageHeader component with mystical styling
 * Server Component - no client-side state
 */
export default function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("w-full py-6 px-4", className)}>
      {/* Breadcrumb Navigation */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex items-center gap-1.5 text-sm">
            {breadcrumb.map((item, index) => {
              const isLast = index === breadcrumb.length - 1;

              return (
                <li key={index} className="flex items-center gap-1.5">
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="text-spiritual-gold hover:text-spiritual-gold-light transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        "text-muted-foreground",
                        isLast && "text-foreground font-medium"
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="text-spiritual-gold/50 text-xs font-light"
                    >
                      /
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Title and Actions Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <Heading variant="mystical" size="2xl" className="mb-0">
            {title}
          </Heading>

          {/* Subtitle */}
          {subtitle && (
            <p className="mt-2 text-muted-foreground text-sm font-sans">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions Slot */}
        {actions && (
          <div className="shrink-0 flex items-center gap-3">{actions}</div>
        )}
      </div>

      {/* Mystic Divider */}
      <div className="mt-4">
        <MysticDivider symbol="star" variant="subtle" />
      </div>
    </header>
  );
}