import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { TemplateGallery } from "@/components/email/TemplateGallery";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminEmailTemplateGallery = () => {
  const navigate = useNavigate();

  const handleImport = (template: any) => {
    // Store template in session storage for quick access
    sessionStorage.setItem("importedTemplate", JSON.stringify(template));
    toast.success("Template ready to use! Navigate to Welcome Sequences to add it.");
  };

  return (
    <DashboardLayout>
      <PageContainer>
        <BreadcrumbNav />
        <div className="mt-6">
          <TemplateGallery onImport={handleImport} />
        </div>
      </PageContainer>
    </DashboardLayout>
  );
};

export default AdminEmailTemplateGallery;
