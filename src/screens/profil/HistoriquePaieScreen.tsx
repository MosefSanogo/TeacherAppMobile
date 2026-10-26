import { Calendar, Clock, GraduationCap, Wallet } from "lucide-react-native";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ErrorState } from "@/components/ErrorState";
import ThemeHarder from "@/components/theme-hearder";
import { ThemedView } from "@/components/themed-view";
import { COLORS, SHADOWS, SIZES } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { ScolariteStackNavigationProp } from "@/navigation/stacks/ScolariteStack";
import paiementService from "@/services/other.service";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

type Paiement = {
  id: number;
  idP: number;
  montant: number;
  mois: string;
  date: string;
  anneeScolaire: string;
  heure: string;
};

const MOIS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const formatMontant = (montant: number) =>
  `${new Intl.NumberFormat("fr-FR").format(montant)} FCFA`;

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatHeure = (heure: string) => {
  if (!heure) return "-";
  // accepte "14:30:00" ou une date ISO complète
  if (heure.includes("T")) {
    const d = new Date(heure);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  return heure.slice(0, 5);
};

const formatMois = (mois: string | number) => {
  const n = Number(mois);
  if (!isNaN(n) && n >= 1 && n <= 12) return MOIS[n - 1];
  return String(mois);
};

const HistoriquePaieScreen = () => {
  const navigation = useNavigation<ScolariteStackNavigationProp>();
  const { userInfo } = useAuth();
  const id = Number(userInfo?.id);

  const {
    data: paiementsData,
    isLoading,
    isRefetching,
    refetch,
    isError,
    error,
  } = useQuery<any[]>({
    queryKey: ["paiements", id],
    queryFn: async () => {
      try {
        const data: any[] = await paiementService.getPaiements(id);
        return data;
      } catch (error) {
        return [];
      }
    },
  });

  const paiements: Paiement[] = useMemo(() => {
    if (!paiementsData) return [];
    return paiementsData.map((item) => ({
      id: item.id,
      idP: item.idP,
      montant: Number(item.montant),
      mois: item.mois,
      date: item.date,
      anneeScolaire: item.anneeScolaire,
      heure: item.heure,
    }));
  }, [paiementsData]);

  const total = useMemo(
    () => paiements.reduce((somme, p) => somme + (p.montant || 0), 0),
    [paiements],
  );

  const renderPaiement = ({ item }: { item: Paiement }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrapper}>
          <Wallet size={20} color={COLORS.primary} />
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.month}>{formatMois(item.mois)}</Text>
          <Text style={styles.amount}>{formatMontant(item.montant)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Calendar size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.detail}>
          <Clock size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{formatHeure(item.heure)}</Text>
        </View>
      </View>

      <View style={[styles.detail, { marginTop: SIZES.spaceSM }]}>
        <GraduationCap size={14} color={COLORS.textSecondary} />
        <Text style={styles.detailText}>
          Année scolaire : {item.anneeScolaire}
        </Text>
      </View>
    </View>
  );

  if (isError) {
    // On détecte si c'est une erreur réseau ou autre
    const isNetwork = error.message === "NETWORK_ERROR" || !error;

    return (
      <ErrorState
        isNetworkError={isNetwork}
        message={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemeHarder
        title="Historique des paiements"
        onBackPress={() => navigation.goBack()}
        style={{ marginTop: -32 }}
      />
      <FlatList
        data={paiements}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPaiement}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.subtitle}>
              Consultez la liste de vos paiements.
            </Text>

            {paiements.length > 0 && (
              <View style={styles.summaryCard}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{paiements.length}</Text>
                  <Text style={styles.statLabel}>Paiements</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: COLORS.success }]}>
                    {formatMontant(total)}
                  </Text>
                  <Text style={styles.statLabel}>Total perçu</Text>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.emptyText}>Chargement...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Wallet size={36} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Aucun paiement</Text>
              <Text style={styles.emptyText}>
                Aucun paiement n'a encore été enregistré.
              </Text>
            </View>
          )
        }
      />
    </ThemedView>
  );
};

export default HistoriquePaieScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SIZES.spaceLG,
    paddingBottom: SIZES.space2XL,
  },
  subtitle: {
    fontSize: SIZES.textSM,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spaceLG,
    marginTop: SIZES.spaceMD,
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: SIZES.spaceLG,
    marginBottom: SIZES.spaceLG,
    borderRadius: SIZES.radiusLG,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  stat: {
    alignItems: "center",
    gap: SIZES.spaceXS,
  },
  statValue: {
    fontSize: SIZES.textXL,
    fontWeight: 700,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },
  card: {
    padding: SIZES.spaceMD,
    marginBottom: SIZES.spaceMD,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMD,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.spaceMD,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderInfo: {
    flex: 1,
  },
  month: {
    fontSize: SIZES.textSM,
    fontWeight: 600,
    color: COLORS.textSecondary,
  },
  amount: {
    marginTop: 2,
    fontSize: SIZES.textLG,
    fontWeight: 700,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.spaceMD,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.spaceXS,
  },
  detailText: {
    fontSize: SIZES.textXS,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SIZES.space2XL,
    paddingHorizontal: SIZES.spaceLG,
  },
  emptyTitle: {
    marginTop: SIZES.spaceMD,
    fontSize: SIZES.textMD,
    fontWeight: 600,
    color: COLORS.text,
  },
  emptyText: {
    marginTop: SIZES.spaceXS,
    textAlign: "center",
    fontSize: SIZES.textSM,
    color: COLORS.textSecondary,
  },
});
