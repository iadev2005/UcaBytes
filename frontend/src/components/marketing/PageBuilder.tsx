import type { BusinessPage } from '../../types/templates';
import PageEditor from './PageEditor';

type PageBuilderProps = {
  page: BusinessPage;
  onSave: (page: BusinessPage) => void;
  onPublish: (page: BusinessPage) => void;
};

export default function PageBuilder({ page, onSave, onPublish }: PageBuilderProps) {
  return (
    <PageEditor
      page={page}
      onSave={onSave}
      onPublish={onPublish}
    />
  );
} 