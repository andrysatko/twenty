import { RecordChip } from '@/object-record/components/RecordChip';

import { useRelationField } from '../../hooks/useRelationField';

export const RelationFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useRelationField();

  if (!fieldValue || !fieldDefinition) return null;

  return (
    <RecordChip
      objectNameSingular={
        fieldDefinition.metadata.relationObjectMetadataNameSingular
      }
      record={fieldValue}
    />
  );
};
