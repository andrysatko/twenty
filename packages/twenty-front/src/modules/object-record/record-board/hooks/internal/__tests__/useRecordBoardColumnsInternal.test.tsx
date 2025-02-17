import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import gql from 'graphql-tag';
import { RecoilRoot, useRecoilState, useSetRecoilState } from 'recoil';

import { useBoardColumnsInternal } from '@/object-record/record-board/hooks/internal/useRecordBoardColumnsInternal';
import { useRecordBoardScopedStates } from '@/object-record/record-board/hooks/internal/useRecordBoardScopedStates';
import { RecordBoardScope } from '@/object-record/record-board/scopes/RecordBoardScope';
import { BoardColumnDefinition } from '@/object-record/record-board/types/BoardColumnDefinition';

jest.mock('@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery', () => ({
  useMapFieldMetadataToGraphQLQuery: jest.fn().mockReturnValue(() => '\n'),
}));

const mocks = [
  {
    request: {
      query: gql`
        mutation UpdateOnePipelineStep(
          $idToUpdate: ID!
          $input: PipelineStepUpdateInput!
        ) {
          updatePipelineStep(id: $idToUpdate, data: $input) {
            id
          }
        }
      `,
      variables: { idToUpdate: '1', input: { position: 0 } },
    },
    result: jest.fn(() => ({
      data: { updatePipelineStep: { id: '' } },
    })),
  },
];

const scopeId = 'scopeId';
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <RecordBoardScope recordBoardScopeId={scopeId}>
      <RecoilRoot>{children}</RecoilRoot>
    </RecordBoardScope>
  </MockedProvider>
);

const renderHookConfig = {
  wrapper: Wrapper,
};

describe('useBoardColumnsInternal', () => {
  it('should update boardColumns state when moving to left and right', async () => {
    const { result } = renderHook(() => {
      const [boardColumnsList, setBoardColumnsList] = useRecoilState(
        useRecordBoardScopedStates().boardColumnsState,
      );
      return {
        boardColumns: useBoardColumnsInternal(),
        boardColumnsList,
        setBoardColumnsList,
      };
    }, renderHookConfig);
    const columns: BoardColumnDefinition[] = [
      {
        id: '1',
        title: '1',
        position: 0,
      },
      {
        id: '2',
        title: '2',
        position: 1,
      },
    ];
    act(() => {
      result.current.setBoardColumnsList(columns);
    });

    act(() => {
      result.current.boardColumns.handleMoveBoardColumn('right', columns[0]);
    });

    await waitFor(() => {
      expect(result.current.boardColumnsList).toStrictEqual([
        { id: '2', title: '2', position: 0, index: 0 },
        { id: '1', title: '1', position: 1, index: 1 },
      ]);
    });

    act(() => {
      result.current.boardColumns.handleMoveBoardColumn('left', columns[0]);
    });

    await waitFor(() => {
      expect(result.current.boardColumnsList).toStrictEqual([
        { id: '1', title: '1', position: 0, index: 0 },
        { id: '2', title: '2', position: 1, index: 1 },
      ]);
    });
  });

  it('should call apollo mutation after persistBoardColumns', async () => {
    const { result } = renderHook(() => {
      return {
        boardColumns: useBoardColumnsInternal(),
        setBoardColumnsList: useSetRecoilState(
          useRecordBoardScopedStates().boardColumnsState,
        ),
      };
    }, renderHookConfig);
    const columns: BoardColumnDefinition[] = [
      {
        id: '1',
        title: '1',
        position: 0,
      },
    ];
    act(() => {
      result.current.setBoardColumnsList(columns);
    });

    act(() => {
      result.current.boardColumns.persistBoardColumns();
    });

    await waitFor(() => {
      expect(mocks[0].result).toHaveBeenCalled();
    });
  });
});
