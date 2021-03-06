import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'seamless-immutable';
import { DropdownKebab, ListView, MenuItem, Button, Spinner, OverlayTrigger, Popover, Icon } from 'patternfly-react';
import ConversionHostRemoveButton from './ConversionHostRemoveButton';
import ConversionHostRetryButton from './ConversionHostRetryButton';
import StopPropagationOnClick from '../../../../common/StopPropagationOnClick';
import { FINISHED, ERROR, ENABLE, DISABLE } from '../ConversionHostsSettingsConstants';
import { getConversionHostTaskLogFile, inferTransportMethod } from '../../../helpers';

const ConversionHostsListItem = ({
  listItem,
  isTask,
  isInUse,
  setHostToDeleteAction,
  showConversionHostDeleteModalAction,
  setConversionHostTaskToRetryAction,
  showConversionHostRetryModalAction,
  isPostingConversionHosts,
  saveTextFileAction
}) => {
  let mostRecentTask = listItem;
  if (!isTask) {
    const { enable, disable } = listItem.meta.tasksByOperation;
    const mostRecentFirst = (a, b) => (a.updated_on > b.updated_on ? -1 : a.updated_on < b.updated_on ? 1 : 0);
    const lastEnableTask = enable && Immutable.asMutable(enable).sort(mostRecentFirst)[0];
    const lastDisableTask = disable && Immutable.asMutable(disable).sort(mostRecentFirst)[0];
    mostRecentTask =
      lastEnableTask && (!lastDisableTask || lastDisableTask.updated_on < lastEnableTask.updated_on)
        ? lastEnableTask
        : lastDisableTask;
  }

  let statusIcon;
  let statusMessage;
  if (mostRecentTask && mostRecentTask.status === ERROR) {
    statusIcon = <ListView.Icon type="pf" name="error-circle-o" />;
    statusMessage = mostRecentTask.meta.operation === ENABLE ? __('Configuration Failed') : __('Removal Failed');
  } else if (mostRecentTask && mostRecentTask.state !== FINISHED) {
    statusIcon = <Spinner loading size="sm" inline />;
    statusMessage = mostRecentTask.meta.operation === ENABLE ? __('Configuring...') : __('Removing...');
  } else {
    statusIcon = <ListView.Icon type="pf" name="ok" />;
    statusMessage = __('Configured');
  }

  const taskInfoPopover = (
    <OverlayTrigger
      rootClose
      trigger="click"
      placement="top"
      overlay={
        <Popover id="task-info-popover" style={{ width: 400 }}>
          {mostRecentTask ? (
            <React.Fragment>
              <strong>{__('State:')}</strong> {mostRecentTask.state}
              <br />
              <strong>{__('Message:')}</strong> {mostRecentTask.message}
            </React.Fragment>
          ) : (
            __('No configuration task information available')
          )}
        </Popover>
      }
    >
      <Button bsStyle="link">
        <Icon type="pf" name="info" />
      </Button>
    </OverlayTrigger>
  );

  let actionButtons;
  if (isTask) {
    const isFinished = mostRecentTask.state === FINISHED;
    const isFailed = mostRecentTask.status === ERROR;
    const taskHasRequestParams = mostRecentTask.context_data && mostRecentTask.context_data.request_params;
    actionButtons = (
      <React.Fragment>
        {isFinished &&
          isFailed &&
          taskHasRequestParams && (
            <ConversionHostRetryButton
              task={mostRecentTask}
              setConversionHostTaskToRetryAction={setConversionHostTaskToRetryAction}
              showConversionHostRetryModalAction={showConversionHostRetryModalAction}
              disabled={isPostingConversionHosts}
            />
          )}
        <ConversionHostRemoveButton
          hostOrTask={mostRecentTask}
          setHostToDeleteAction={setHostToDeleteAction}
          showConversionHostDeleteModalAction={showConversionHostDeleteModalAction}
          disabled={isInUse || !(isFinished && isFailed)}
        />
      </React.Fragment>
    );
  } else {
    actionButtons = (
      <ConversionHostRemoveButton
        hostOrTask={listItem}
        setHostToDeleteAction={setHostToDeleteAction}
        showConversionHostDeleteModalAction={showConversionHostDeleteModalAction}
        disabled={
          isInUse || (mostRecentTask && mostRecentTask.meta.operation === DISABLE && mostRecentTask.state !== FINISHED)
        }
      />
    );
  }

  const logDownloadEnabled =
    mostRecentTask &&
    mostRecentTask.state === FINISHED &&
    mostRecentTask.context_data &&
    !!(
      mostRecentTask.context_data.conversion_host_enable ||
      mostRecentTask.context_data.conversion_host_check ||
      mostRecentTask.context_data.conversion_host_disable
    );

  const kebabMenu = mostRecentTask ? (
    <StopPropagationOnClick>
      <DropdownKebab id={`task-kebab-${mostRecentTask.id}`} pullRight>
        <MenuItem
          disabled={!logDownloadEnabled}
          onClick={() => {
            const file = getConversionHostTaskLogFile(mostRecentTask);
            if (file) saveTextFileAction(file);
          }}
        >
          {__('Download Log')}
        </MenuItem>
      </DropdownKebab>
    </StopPropagationOnClick>
  ) : null;

  return (
    <ListView.Item
      heading={listItem.name}
      additionalInfo={[
        <ListView.InfoItem key="transport-method">{inferTransportMethod(listItem)}</ListView.InfoItem>,
        <ListView.InfoItem key="task-status">
          {statusIcon}
          {statusMessage}
          {taskInfoPopover}
        </ListView.InfoItem>
      ]}
      stacked
      actions={
        <div className="conversion-hosts-list-actions">
          {actionButtons}
          {kebabMenu}
        </div>
      }
    />
  );
};

ConversionHostsListItem.propTypes = {
  listItem: PropTypes.object,
  isTask: PropTypes.bool,
  isInUse: PropTypes.bool,
  setHostToDeleteAction: PropTypes.func,
  showConversionHostDeleteModalAction: PropTypes.func,
  setConversionHostTaskToRetryAction: PropTypes.func,
  showConversionHostRetryModalAction: PropTypes.func,
  isPostingConversionHosts: PropTypes.bool,
  saveTextFileAction: PropTypes.func
};

export default ConversionHostsListItem;
