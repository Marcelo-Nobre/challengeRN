import { StyleProp, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 24, color = '#0F172A', style }: IconProps) {
  return <Ionicons name={name as any} size={size} color={color} style={style} />;
}
