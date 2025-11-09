import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { StructuredData } from "./StructuredData";
import { Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path: string;
}

const routeLabels: Record<string, string> = {
  "": "Home",
  dashboard: "Dashboard",
  "add-car": "Add Car",
  "select-host": "Select Host",
  "my-cars": "My Cars",
  cars: "Cars",
  view: "View Details",
  edit: "Edit Car",
  "schedule-maintenance": "Schedule Maintenance",
  "host-requests": "Host Requests",
  "hosting-details": "Hosting Details",
  "host-car-management": "Car Management",
  "client-analytics": "Analytics",
  "host-analytics": "Analytics",
  "client-fixed-expenses": "Fixed Expenses",
  settings: "Settings",
  support: "Support",
  faq: "FAQ",
  privacy: "Privacy Policy",
  terms: "Terms of Use",
  onboarding: "Welcome",
  "account-pending": "Account Pending",
  subscribe: "Subscribe",
  admin: "Admin",
  "manage-accounts": "Manage Accounts",
};

export function BreadcrumbNav() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on home page or auth pages
  if (
    pathSegments.length === 0 ||
    location.pathname === "/" ||
    location.pathname.startsWith("/register") ||
    location.pathname === "/login"
  ) {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", path: "/dashboard" },
  ];

  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip UUIDs and numeric IDs in breadcrumbs
    if (
      segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ||
      !isNaN(Number(segment))
    ) {
      return;
    }

    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, path: currentPath });
  });

  // Generate schema.org BreadcrumbList data
  const breadcrumbListData = {
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: `https://teslys.app${crumb.path}`,
    })),
  };

  return (
    <>
      <StructuredData type="breadcrumblist" data={breadcrumbListData} />
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return (
              <div key={crumb.path} className="flex items-center gap-1.5">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.path} className="flex items-center gap-1">
                        {index === 0 && <Home className="h-3.5 w-3.5" />}
                        <span>{crumb.label}</span>
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
