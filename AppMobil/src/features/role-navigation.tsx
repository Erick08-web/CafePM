import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, usePathname, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AppCard } from "@/components";
import { colors, radius, spacing, typography } from "@/theme";

type NavItem = {
  href: Href;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

type RoleTabBarProps = {
  items: NavItem[];
};

export function RoleTabBar({ items }: RoleTabBarProps) {
  const pathname = usePathname();

  return (
    <AppCard compact>
      <View style={{ flexDirection: "row", gap: spacing.xs, justifyContent: "space-between" }}>
        {items.map((item) => {
          const selected = pathname === String(item.href);

          return (
            <Link href={item.href} key={String(item.href)} asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: selected ? colors.verdeOscuro : "transparent",
                  borderRadius: radius.md,
                  flex: 1,
                  gap: 4,
                  minHeight: 58,
                  justifyContent: "center",
                  opacity: pressed ? 0.78 : 1,
                  paddingHorizontal: 4,
                  paddingVertical: spacing.sm,
                })}
              >
                <MaterialCommunityIcons name={item.icon} size={21} color={selected ? colors.textoInvertido : colors.textoSuave} />
                <Text
                  numberOfLines={1}
                  selectable
                  style={{
                    color: selected ? colors.textoInvertido : colors.textoSuave,
                    fontSize: typography.caption,
                    fontWeight: "900",
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </AppCard>
  );
}

export const meseroNav: NavItem[] = [
  { href: "/mesero", label: "Inicio", icon: "home-outline" },
  { href: "/mesero/mesas" as Href, label: "Mesas", icon: "table-chair" },
  { href: "/mesero/nueva-orden" as Href, label: "Orden", icon: "plus-circle-outline" },
  { href: "/mesero/pedidos" as Href, label: "Pedidos", icon: "clipboard-list-outline" },
  { href: "/mesero/perfil" as Href, label: "Perfil", icon: "account-circle-outline" },
];

export const cocinaNav: NavItem[] = [
  { href: "/cocina", label: "Inicio", icon: "home-outline" },
  { href: "/cocina/pedidos" as Href, label: "Pedidos", icon: "clipboard-text-outline" },
  { href: "/cocina/listos" as Href, label: "Listos", icon: "check-circle-outline" },
  { href: "/cocina/perfil" as Href, label: "Perfil", icon: "account-circle-outline" },
];

export const cajaNav: NavItem[] = [
  { href: "/caja", label: "Inicio", icon: "home-outline" },
  { href: "/caja/cuentas" as Href, label: "Cuentas", icon: "receipt-text-outline" },
  { href: "/caja/historial" as Href, label: "Historial", icon: "history" },
  { href: "/caja/perfil" as Href, label: "Perfil", icon: "account-circle-outline" },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Inicio", icon: "home-outline" },
  { href: "/admin/resumen" as Href, label: "Resumen", icon: "chart-donut" },
  { href: "/admin/inventario" as Href, label: "Inventario", icon: "package-variant-closed" },
  { href: "/admin/usuarios" as Href, label: "Usuarios", icon: "account-group-outline" },
  { href: "/admin/perfil" as Href, label: "Perfil", icon: "account-circle-outline" },
];
