import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { availableRecordBoardCardFieldsScopedState } from '../availableRecordBoardCardFieldsScopedState';
import { recordBoardCardFieldsScopedState } from '../recordBoardCardFieldsScopedState';

export const hiddenRecordBoardCardFieldsScopedSelector = createSelectorScopeMap(
  {
    key: 'hiddenRecordBoardCardFieldsScopedSelector',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const fields = get(recordBoardCardFieldsScopedState({ scopeId }));
        const fieldKeys = fields.map(({ fieldMetadataId }) => fieldMetadataId);

        const otherAvailableKeys = get(
          availableRecordBoardCardFieldsScopedState({ scopeId }),
        ).filter(({ fieldMetadataId }) => !fieldKeys.includes(fieldMetadataId));

        return [
          ...fields.filter((field) => !field.isVisible),
          ...otherAvailableKeys,
        ];
      },
  },
);
