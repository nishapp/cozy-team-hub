
import { ChevronRight } from "lucide-react";

interface BookmarkBreadcrumbProps {
  breadcrumbs: { id: string | null; name: string }[];
  onBreadcrumbClick: (id: string | null) => void;
}

const BookmarkBreadcrumb: React.FC<BookmarkBreadcrumbProps> = ({ 
  breadcrumbs, 
  onBreadcrumbClick 
}) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
            )}
            <button
              onClick={() => onBreadcrumbClick(crumb.id)}
              className={`
                text-sm font-medium hover:text-primary transition-colors
                ${index === breadcrumbs.length - 1 ? 'text-primary cursor-default' : 'text-muted-foreground'}
              `}
              disabled={index === breadcrumbs.length - 1}
            >
              {crumb.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BookmarkBreadcrumb;
