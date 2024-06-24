import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { FullGameState } from './internal-game-state';
import { onQuestProgressUpdated } from './quest';

export interface DeathrattleTriggeredInput {
	readonly boardWithDeadEntity: BoardEntity[];
	readonly boardWithDeadEntityHero: BgsPlayerEntity;
	readonly deadEntity: BoardEntity;
	readonly otherBoard: BoardEntity[];
	readonly otherBoardHero: BgsPlayerEntity;
	readonly gameState: FullGameState;
}

export const onDeathrattleTriggered = (input: DeathrattleTriggeredInput) => {
	const quests = input.boardWithDeadEntityHero.questEntities ?? [];
	for (const quest of quests) {
		switch (quest.CardId) {
			case CardIds.ExhumeTheBones:
				onQuestProgressUpdated(
					input.boardWithDeadEntityHero,
					quest,
					input.boardWithDeadEntity,
					input.gameState,
				);
				break;
		}
	}

	input.boardWithDeadEntity
		.filter((e) => e.cardId === CardIds.GhoulAcabra_BG29_863 || e.cardId === CardIds.GhoulAcabra_BG29_863_G)
		.forEach((ghoul) => {
			ghoul.scriptDataNum1 = ghoul.scriptDataNum1 ?? 0;
			ghoul.scriptDataNum1++;
			// const buff = ghoul.cardId === CardIds.GhoulAcabra_BG29_863_G ? 4 : 2;
			// addStatsToBoard(
			// 	ghoul,
			// 	input.boardWithDeadEntity,
			// 	input.boardWithDeadEntityHero,
			// 	buff,
			// 	buff,
			// 	input.gameState,
			// );
		});
};
