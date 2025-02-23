import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard, StartOfCombatCard } from '../../card.interface';

export const ElectricSynthesizer: StartOfCombatCard & BattlecryCard = {
	cardIds: [CardIds.ElectricSynthesizer_BG26_963, CardIds.ElectricSynthesizer_BG26_963_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const otherDragons = input.playerBoard
			.filter((e) =>
				hasCorrectTribe(
					e,
					input.playerEntity,
					Race.DRAGON,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
			)
			.filter((e) => e.entityId !== minion.entityId);
		const buff = minion.cardId === CardIds.ElectricSynthesizer_BG26_963_G ? 2 : 1;
		for (const entity of otherDragons) {
			modifyStats(entity, buff, buff, input.playerBoard, input.playerEntity, input.gameState);
		}
		return true;
	},
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const otherDragons = input.board
			.filter((e) =>
				hasCorrectTribe(e, input.hero, Race.DRAGON, input.gameState.anomalies, input.gameState.allCards),
			)
			.filter((e) => e.entityId !== minion.entityId);
		const buff = minion.cardId === CardIds.ElectricSynthesizer_BG26_963_G ? 2 : 1;
		for (const entity of otherDragons) {
			modifyStats(entity, buff, buff, input.board, input.hero, input.gameState);
		}
	},
};
