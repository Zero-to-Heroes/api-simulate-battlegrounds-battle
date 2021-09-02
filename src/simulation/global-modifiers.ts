// /* eslint-disable @typescript-eslint/no-use-before-define */
// import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
// import { BoardEntity } from '../board-entity';
// import { CardsData } from '../cards/cards-data';
// import { isCorrectTribe, stringifySimple } from '../utils';

// export const applyGlobalModifiers = (board1: BoardEntity[], board2: BoardEntity[], data: CardsData, cards: AllCardsService): void => {
// 	const totalMurlocs =
// 		board1.map((entity) => cards.getCard(entity.cardId).race).filter((race) => isCorrectTribe(race, Race.MURLOC)).length +
// 		board2.map((entity) => cards.getCard(entity.cardId).race).filter((race) => isCorrectTribe(race, Race.MURLOC)).length;
// 	console.log('total murlocs before apply', stringifySimple(board1), stringifySimple(board2));
// 	for (const entity of board1) {
// 		mapEntity(entity, totalMurlocs);
// 	}
// 	for (const entity of board2) {
// 		mapEntity(entity, totalMurlocs);
// 	}
// 	console.log('total murlocs after apply', stringifySimple(board1), stringifySimple(board2));
// };

// export const removeGlobalModifiers = (board1: BoardEntity[], board2: BoardEntity[], cards: AllCardsService): void => {
// 	const totalMurlocs =
// 		board1.map((entity) => cards.getCard(entity.cardId).race).filter((race) => isCorrectTribe(race, Race.MURLOC)).length +
// 		board2.map((entity) => cards.getCard(entity.cardId).race).filter((race) => isCorrectTribe(race, Race.MURLOC)).length;
// 	console.log('total murlocs before remove', stringifySimple(board1), stringifySimple(board2));
// 	for (const entity of board1) {
// 		removeGlobalModifiersForEntity(entity, totalMurlocs);
// 	}
// 	for (const entity of board2) {
// 		removeGlobalModifiersForEntity(entity, totalMurlocs);
// 	}
// 	console.log('total murlocs after remove', stringifySimple(board1), stringifySimple(board2));
// };

// const removeGlobalModifiersForEntity = (entity: BoardEntity, totalMurlocs: number): void => {
// 	// First time the board state is received, the murkeye buff is applied so we have to remove it
// 	if (!entity.previousAttack) {
// 		if (
// 			[
// 				CardIds.Collectible.Neutral.OldMurkEyeLegacy,
// 				CardIds.Collectible.Neutral.OldMurkEyeVanilla,
// 				CardIds.NonCollectible.Neutral.OldMurkEyeBattlegrounds,
// 			].indexOf(entity.cardId) !== -1
// 		) {
// 			// Only "other" murlocs
// 			console.log('updating murkeye', entity.attack, totalMurlocs);
// 			entity.attack -= (totalMurlocs - 1) * (entity.cardId === CardIds.NonCollectible.Neutral.OldMurkEyeBattlegrounds ? 2 : 1);
// 			console.log('updated murkeye', entity.attack, totalMurlocs);
// 		}
// 		entity.previousAttack = undefined;
// 		entity.attacking = undefined;
// 		entity.lastAffectedByEntity = undefined;
// 	}
// };

// const mapEntity = (entity: BoardEntity, totalMurlocs: number): void => {
// 	if (
// 		[
// 			CardIds.Collectible.Neutral.OldMurkEyeLegacy,
// 			CardIds.Collectible.Neutral.OldMurkEyeVanilla,
// 			CardIds.NonCollectible.Neutral.OldMurkEyeBattlegrounds,
// 		].indexOf(entity.cardId) !== -1
// 	) {
// 		applyMurkeyeBuff(entity, totalMurlocs);
// 	}
// };

// const applyMurkeyeBuff = (entity: BoardEntity, totalMurlocs: number): void => {
// 	entity.previousAttack = entity.attack;
// 	// Only "other" murlocs
// 	console.log('updating murkeye2', entity.attack, totalMurlocs);
// 	entity.attack += (totalMurlocs - 1) * (entity.cardId === CardIds.NonCollectible.Neutral.OldMurkEyeBattlegrounds ? 2 : 1);
// 	console.log('updated murkeye2', entity.attack, totalMurlocs);
// };
