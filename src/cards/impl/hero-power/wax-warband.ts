import { ALL_BG_RACES, AllCardsService, Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { shuffleArray } from '../../../services/utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { getEffectiveTribesForEntity } from '../../../utils';

export const WaxWarband = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerEntity.heroPowerUsed) {
			if (input.playerBoard.length > 0) {
				const boardWithTribes = input.playerBoard.filter(
					(e) => !!getEffectiveTribesForEntity(e, input.playerEntity, input.gameState.allCards).length,
				);
				const boardWithoutAll = boardWithTribes.filter(
					(e) => !input.gameState.allCards.getCard(e.cardId).races?.includes(Race[Race.ALL]),
				);
				const selectedMinions = selectMinions(boardWithoutAll, ALL_BG_RACES, input.gameState.allCards);
				const allMinions = [
					...selectedMinions,
					...boardWithTribes.filter((e) =>
						input.gameState.allCards.getCard(e.cardId).races?.includes(Race[Race.ALL]),
					),
				];
				allMinions.forEach((e) => {
					modifyStats(
						e,
						input.gameState.cardsData.getTavernLevel(e.cardId),
						input.gameState.cardsData.getTavernLevel(e.cardId),
						input.playerBoard,
						input.playerEntity,
						input.gameState,
					);
					input.gameState.spectator.registerPowerTarget(
						input.playerEntity,
						e,
						input.playerBoard,
						input.playerEntity,
						input.opponentEntity,
					);
				});
				return true;
			}
		}
	},
};

// Not perfect, as I don't think this solves the issue where some cards are mutually exclusive
const selectMinions = (minions: BoardEntity[], tribes: Race[], allCards: AllCardsService): BoardEntity[] => {
	// Step 1
	const minionsByTribe: { [tribe: string]: BoardEntity[] } = {};
	for (const minion of minions) {
		for (const tribe of allCards.getCard(minion.cardId).races ?? []) {
			if (!minionsByTribe[tribe]) {
				minionsByTribe[tribe] = [];
			}
			minionsByTribe[tribe].push(minion);
		}
	}
	for (const tribe of ALL_BG_RACES) {
		minionsByTribe[tribe] = shuffleArray(minionsByTribe[Race[tribe]] ?? []);
	}

	const selectedMinions: BoardEntity[] = [];

	// Step 3
	for (const tribe of tribes) {
		if (minionsByTribe[tribe]) {
			minionsByTribe[tribe].sort(
				(a, b) => allCards.getCard(a.cardId).races.length - allCards.getCard(b.cardId).races.length,
			);
			for (const minion of minionsByTribe[tribe]) {
				if (!selectedMinions.includes(minion)) {
					selectedMinions.push(minion);
					break;
				}
			}
		}
	}

	// Step 4
	return selectedMinions;
};