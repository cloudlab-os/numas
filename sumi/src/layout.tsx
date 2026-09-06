import React from 'react';
import { SlotLocation, SlotRenderer } from '@opensumi/ide-core-browser';
import { BoxPanel, SplitPanel } from '@opensumi/ide-core-browser/lib/components';
import { useInjectable } from '@opensumi/ide-core-browser/lib/react-hooks/injectable-hooks';
import { IMainLayoutService } from '@opensumi/ide-main-layout/lib/common';

import { WorkspacePicker } from './extensions/workspace/WorkspacePicker';
import { FilePicker } from './extensions/filepicker/FilePicker';

/**
 * 布局组件.
 *
 * 初始宽度走 App.tsx 的 appConfig.panelSizes (tabbarService.updatePanelSize).
 * 拖拽下限走 SlotRenderer 的 minResize: SplitPanel 写成 data-min-resize, sash 读这个值卡住.
 * minSize 是 CSS min-width, 右侧栏需要能收起, 所以不要给 right 设 minSize.
 */
export function LayoutComponent(): React.ReactElement {
  useInjectable<IMainLayoutService>(IMainLayoutService);

  return (
    <React.Fragment>
      <BoxPanel direction="top-to-bottom">
        <SplitPanel id="main-horizontal" flex={1}>
          <SlotRenderer slot={SlotLocation.left} isTabbar />
          <SlotRenderer flex={2} flexGrow={1} slot={SlotLocation.main} />
          <SlotRenderer slot={SlotLocation.right} isTabbar minResize={280} />
        </SplitPanel>
      </BoxPanel>
      <WorkspacePicker />
      <FilePicker />
    </React.Fragment>
  );
}
