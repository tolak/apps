// Copyright 2017-2021 @polkadot/app-bounties authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveCollectiveProposal } from '@polkadot/api-derive/types';
import type { BlockNumber, Bounty as BountyType, BountyIndex } from '@polkadot/types/interfaces';

import BN from 'bn.js';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { AddressSmall, Icon, LinkExternal } from '@polkadot/react-components';
import { BlockToTime, FormatBalance } from '@polkadot/react-query';
import { formatNumber } from '@polkadot/util';

import VotingResultsColumn from './Voting/VotersColumn';
import VotingDescription from './Voting/VotingDescription';
import { BountyActions } from './BountyActions';
import { BountyInfos } from './BountyInfos';
import { getBountyStatus, truncateTitle } from './helpers';
import { useTranslation } from './translate';

interface Props {
  bestNumber: BlockNumber;
  bounty: BountyType;
  className?: string;
  description: string;
  index: BountyIndex;
  proposals?: DeriveCollectiveProposal[];
}

interface DueProps {
  dueBlocks: BN | undefined;
  until: 'update' | 'payout';
}

const EMPTY_CELL = '-';

function Bounty ({ bestNumber, bounty, className = '', description, index, proposals }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const { bond, curatorDeposit, fee, proposer, status, value } = bounty;

  const updateStatus = useCallback(() => getBountyStatus(status), [status]);

  const { beneficiary, bountyStatus, curator, unlockAt, updateDue } = updateStatus();

  const blocksUntilUpdate = useMemo(() => updateDue?.sub(bestNumber), [bestNumber, updateDue]);
  const blocksUntilPayout = useMemo(() => unlockAt?.sub(bestNumber), [bestNumber, unlockAt]);

  const handleOnIconClick = useCallback(
    () => setIsExpanded((isExpanded) => !isExpanded),
    []
  );

  return (
    <>
      <tr className={className}>
        <td>
          <div>{bountyStatus}</div>
          {proposals && (
            <div>
              <VotingDescription
                proposals={proposals}
                status={status}
              />
            </div>
          )}
        </td>
        <td colSpan={2}
          data-testid='description'>{truncateTitle(description, 30)}</td>
        <td><FormatBalance value={value} /></td>
        <td>{curator && <AddressSmall value={curator} />}</td>
        <td>
          {blocksUntilPayout
            ? <DueBlocks
              dueBlocks={blocksUntilPayout}
              until={'payout'}
            />
            : ''}
          {blocksUntilUpdate
            ? <DueBlocks
              dueBlocks={blocksUntilUpdate}
              until={'update'}/>
            : ''}
        </td>
        <td>
          <div className='td-row'>
            {proposals && (
              <BountyInfos
                proposals={proposals}
                status={status}
              />
            )}
            {beneficiary && <AddressSmall value={beneficiary} />}
            <div className='bounty-action-row'>
              <BountyActions
                bestNumber={bestNumber}
                description={description}
                index={index}
                proposals={proposals}
                status={status}
                value={value}
              />
            </div>
          </div>
        </td>
        <td className='fast-actions'>
          <div className='fast-actions-row'>
            <LinkExternal
              data={index}
              isLogo
              type='bounty'
            />
            <div className='table-column-icon'
              onClick={handleOnIconClick}>
              <Icon
                icon={
                  isExpanded
                    ? 'caret-up'
                    : 'caret-down'
                }
              />
            </div>
          </div>
        </td>
      </tr>
      <tr className={className}
        style={{ visibility: isExpanded ? 'visible' : 'collapse' }}>
        <td className='proposer'
          colSpan={2}>
          <div className='proposer-row'>
            <div className='label'>{t('Proposer')}</div>
            <AddressSmall value={proposer} />
          </div>
        </td>
        <td className='column-with-label'
          colSpan={2}>
          <div className='column-with-label-row'>
            <div className='label'>{t('Bond')}</div>
            <div className='inline-balance'><FormatBalance value={bond} /></div>
          </div>
          <div className='column-with-label-row'>
            <div className='label'>{t("Curator's fee")}</div>
            <div className='inline-balance'>{curator ? <FormatBalance value={fee} /> : EMPTY_CELL}</div>
          </div>
          <div className='column-with-label-row'>
            <div className='label'>{t("Curator's deposit")}</div>
            <div className='inline-balance'>{curator ? <FormatBalance value={curatorDeposit} /> : EMPTY_CELL}</div>
          </div>
        </td>
        <td />
        <td />
        <td>
          {proposals && (
            <div className='votes-table'>
              <VotingResultsColumn
                option={'ayes'}
                proposals={proposals}
                status={status}
              />
              <VotingResultsColumn
                option={'nays'}
                proposals={proposals}
                status={status}
              />
            </div>
          )}
        </td>
        <td />
      </tr>
    </>
  );
}

function DueBlocks ({ dueBlocks, until }: DueProps): React.ReactElement<DueProps> {
  const { t } = useTranslation();

  if (!dueBlocks) {
    return <>{EMPTY_CELL}</>;
  }

  return dueBlocks.gtn(0)
    ? <>
      {t<string>('{{blocks}} blocks', { replace: { blocks: formatNumber(dueBlocks) } })}
      <BlockToTime blocks={dueBlocks}
        className='block-to-time'> until {until}</BlockToTime>
    </>
    : <>{t('Claimable')}</>;
}

export default React.memo(styled(Bounty)`
  & .links {
    display: inline-flex;
  }
  & .fast-actions {
    .fast-actions-row {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      & > * + * {
        margin-left: 0.285rem;
      }
    }

    .table-column-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.7rem;
      height: 1.7rem;
      border: 1px solid #DFDFDF;
      border-radius: 4px;
      cursor: pointer;
    }
    .settings-button {
      width: 24px;
      height: 24px;
      padding: 0;
      border-radius: 4px;
      
      svg {
        padding: 0;
        margin: 0;
        color: #000 !important;
      }

      &:hover {
        background: #fff;
      }
      &:focus {
        background: #fff;
        border: 1px solid #616161;
      }
    }
  }
  & .inline-balance {
    width: 50%;
    font-size: 1rem;
    line-height: normal;
  }

  .label {
    text-align: right;
    padding: 0 1.7rem 0 0;
    font-weight: 500;
    font-size: 0.7rem;
    line-height: normal;
    color: #8B8B8B;
    text-transform: uppercase;
  }

  & .column-with-label-row {
    display: flex;
    align-items: center;
    padding: 0 0 1.7rem;

    .label {
      width: 50%;
    }
  }
  
  .proposer-row {
    display: flex;
    align-items: center;
  }

  .td-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .bounty-action-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    
    & > * + * {
      margin-left: 0.6rem;
    }
  }
  .block-to-time {
    margin-top: 0.28rem;
    font-size: 0.7rem;
    line-height: 0.85rem;
    color: #8B8B8B;
  }
  
  & .votes-table {
    display: flex;
    justify-content: space-between;
  }
`);
