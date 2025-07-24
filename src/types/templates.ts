export type ThemeConfig = {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headerStyle: 'minimal' | 'standard' | 'hero';
  footerStyle: 'simple' | 'detailed';
};

export type PageSection = {
  id: string;
  type: 'hero' | 'features' | 'about' | 'products' | 'contact' | 'testimonials';
  content: Record<string, any>;
  isVisible: boolean;
  order: number;
};

export type WebTemplate = {
  id: string;
  name: string;
  category: 'restaurant' | 'retail' | 'services' | 'professional';
  thumbnail: string;
  features: string[];
  defaultTheme: ThemeConfig;
  defaultSections: PageSection[];
};

export type BusinessPage = {
  url: string;
  rif: string;
  businessName: string;
  templateId: string;
  content: {
    sections: PageSection[];
    theme: ThemeConfig;
  };
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
};

export type TemplatePreviewProps = {
  template: WebTemplate;
  onSelect: (templateId: string) => void;
};

export type PageBuilderProps = {
  page: BusinessPage;
  onSave: (page: BusinessPage) => void;
  onPublish: (page: BusinessPage) => void;
}; 