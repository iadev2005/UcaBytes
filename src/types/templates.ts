export type StyleConfig = {
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: number;
  padding?: number;
  margin?: number;
  fontSize?: number;
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  boxShadow?: string;
  opacity?: number;
  animation?: string;
};

export type SectionContent = {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  features: Feature[];
  products: Product[];
  testimonials: Testimonial[];
  stats: Stat[];
  email?: string;
  phone?: string;
  address?: string;
  mapEmbed?: string;
  showSocialMedia?: boolean;
  socialLinks?: SocialLinks;
  content?: string;
  image?: string;
  style?: StyleConfig;
  titleStyle?: StyleConfig;
  descriptionStyle?: StyleConfig;
  buttonStyle?: StyleConfig;
  contentStyle?: StyleConfig;
};

export type Feature = {
  title: string;
  description: string;
  style?: StyleConfig;
};

export type Product = {
  name: string;
  description: string;
  price: number;
  image?: string;
  style?: StyleConfig;
};

export type Testimonial = {
  name: string;
  role?: string;
  text: string;
  image?: string;
  style?: StyleConfig;
};

export type Stat = {
  label: string;
  value: string;
  style?: StyleConfig;
};

export type SocialLinks = {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
};

export type PageSection = {
  id: string;
  type: 'hero' | 'features' | 'products' | 'testimonials' | 'about' | 'contact';
  content: SectionContent;
  isVisible: boolean;
  order: number;
};

export type ThemeConfig = {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  headerStyle: 'standard' | 'minimal';
  footerStyle: 'standard' | 'detailed';
};

export type WebTemplate = {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  features: string[];
  defaultTheme: ThemeConfig;
  defaultSections: PageSection[];
};

export type BusinessPage = {
  businessName: string;
  rif: string;
  url: string;
  templateId: string;
  content: {
    sections: PageSection[];
    theme: ThemeConfig;
  };
  status: 'draft' | 'published';
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