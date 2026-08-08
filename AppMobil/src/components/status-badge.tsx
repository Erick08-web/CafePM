import { Text, View } from "react-native";

import { radius, spacing, states, typography } from "@/theme";

type Tone = keyof typeof states;

type Props = {
  label: string;
  tone?: Tone;
};

export function StatusBadge({ label, tone = "neutral" }: Props) {
  const state = states[tone];

  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: state.background,
        borderColor: state.border,
        borderRadius: radius.pill,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
      }}
    >
      <Text selectable style={{ color: state.text, fontSize: typography.caption, fontWeight: "900" }}>
        {label}
      </Text>
    </View>
  );
}
