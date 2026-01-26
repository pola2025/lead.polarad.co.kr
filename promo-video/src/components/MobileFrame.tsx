import { Rect, Node, NodeProps, Txt } from '@motion-canvas/2d';
import { colors, mobile } from './styles';

export interface MobileFrameProps extends NodeProps {
  children?: Node[];
}

export function MobileFrame(props: MobileFrameProps) {
  return (
    <Node {...props}>
      {/* 디바이스 외부 프레임 */}
      <Rect
        width={mobile.frameWidth}
        height={mobile.frameHeight}
        radius={mobile.borderRadius}
        fill={colors.deviceFrame}
        shadowColor={'rgba(0,0,0,0.3)'}
        shadowBlur={30}
        shadowOffsetY={10}
      />

      {/* 화면 영역 */}
      <Rect
        width={mobile.width}
        height={mobile.height}
        radius={mobile.borderRadius - 10}
        fill={colors.deviceScreen}
        clip
      >
        {props.children}
      </Rect>

      {/* 다이나믹 아일랜드 (노치) */}
      <Rect
        width={mobile.notchWidth}
        height={mobile.notchHeight}
        radius={17}
        fill={colors.deviceFrame}
        y={-mobile.height / 2 + 24}
      />
    </Node>
  );
}
