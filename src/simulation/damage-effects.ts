import { CardIds, CardType, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { pickRandom } from '../services/utils';
import { addStatsToBoard, grantStatsToMinionsOfEachType, hasCorrectTribe, updateDivineShield } from '../utils';
import { dealDamageToRandomEnemy } from './attack';
import { addCardsInHand } from './cards-in-hand';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';
import { modifyAttack, modifyHealth, onStatsUpdate } from './stats';

export const onEntityDamaged = (
	entity: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	damage: number,
	gameState: FullGameState,
) => {
	const spawnedEntities: BoardEntity[] = [];
	const friendlyBoard =
		board?.[0]?.friendly === entity.friendly
			? board
			: otherBoard?.[0]?.friendly === entity.friendly
			? otherBoard
			: [];
	const enemyBoard =
		board?.[0]?.friendly === entity.friendly ? otherBoard : board?.[0]?.friendly === entity.friendly ? board : [];
	const friendlyHero = friendlyBoard === board ? hero : otherHero;
	const enemyHero = friendlyBoard === board ? otherHero : hero;
	switch (entity.cardId) {
		case CardIds.WingedChimera_BG29_844:
		case CardIds.WingedChimera_BG29_844_G:
			const wingedChimeraModifier = entity.cardId === CardIds.WingedChimera_BG29_844_G ? 2 : 1;
			grantStatsToMinionsOfEachType(
				entity,
				board,
				hero,
				wingedChimeraModifier * 2,
				wingedChimeraModifier * 1,
				gameState,
			);
			break;
		case CardIds.UnforgivingTreant_BG29_846:
		case CardIds.UnforgivingTreant_BG29_846_G:
			const treantModifier = entity.cardId === CardIds.UnforgivingTreant_BG29_846_G ? 2 : 1;
			addStatsToBoard(entity, board, hero, treantModifier * 1, 0, gameState);
			break;
		case CardIds.Untameabull_BG29_878:
		case CardIds.Untameabull_BG29_878_G:
			updateDivineShield(entity, board, true, gameState.allCards);
			gameState.spectator.registerPowerTarget(entity, entity, board, hero, otherHero);
			break;
		case CardIds.TrustyPup_BG29_800:
		case CardIds.TrustyPup_BG29_800_G:
			const trustyPupStats = entity.cardId === CardIds.TrustyPup_BG29_800_G ? 2 : 1;
			modifyAttack(entity, trustyPupStats, board, hero, gameState);
			onStatsUpdate(entity, board, hero, gameState);
			gameState.spectator.registerPowerTarget(entity, entity, board, hero, otherHero);
			break;
		case CardIds.SilverGoose_BG29_801:
		case CardIds.SilverGoose_BG29_801_G:
			spawnedEntities.push(
				...spawnEntities(
					entity.cardId === CardIds.SilverGoose_BG29_801_G
						? CardIds.SilverGoose_SilverFledglingToken_BG29_801_Gt
						: CardIds.SilverGoose_SilverFledglingToken_BG29_801t,
					1,
					board,
					hero,
					otherBoard,
					otherHero,
					gameState.allCards,
					gameState.cardsData,
					gameState.sharedState,
					gameState.spectator,
					entity.friendly,
					false,
				),
			);
			break;
		case CardIds.CraftyAranasi_BG29_821:
		case CardIds.CraftyAranasi_BG29_821_G:
			const aranasiLoops = entity.cardId === CardIds.CraftyAranasi_BG29_821_G ? 2 : 1;
			for (let i = 0; i < aranasiLoops; i++) {
				dealDamageToRandomEnemy(enemyBoard, enemyHero, entity, 5, friendlyBoard, friendlyHero, gameState);
			}
			break;
		case CardIds.MarineMatriarch_BG29_610:
		case CardIds.MarineMatriarch_BG29_610_G:
			if (entity.abiityChargesLeft > 0) {
				const numbersOfCardsToAdd = entity.cardId === CardIds.MarineMatriarch_BG29_610_G ? 2 : 1;
				const cardsToAdd = Array.from({ length: numbersOfCardsToAdd }).map(() => null);
				addCardsInHand(hero, board, cardsToAdd, gameState);
				entity.abiityChargesLeft--;
			}
			break;
		case CardIds.VeryHungryWinterfinner_BG29_300:
		case CardIds.VeryHungryWinterfinner_BG29_300_G:
			const winterfinnerStats = entity.cardId === CardIds.VeryHungryWinterfinner_BG29_300_G ? 2 : 1;
			const minionInHand = pickRandom(
				hero.hand.filter(
					(e) => gameState.allCards.getCard(e.cardId).type?.toUpperCase() === CardType[CardType.MINION],
				),
			);
			if (!!minionInHand) {
				minionInHand.attack += winterfinnerStats;
				minionInHand.health += winterfinnerStats;
				minionInHand.maxHealth += winterfinnerStats;
				gameState.spectator.registerPowerTarget(entity, minionInHand, board, hero, otherHero);
			}
			break;
		case CardIds.SoftHeartedSiren_BG26_590:
		case CardIds.SoftHeartedSiren_BG26_590_G:
			if (entity.abiityChargesLeft > 0) {
				const numbersOfCardsToAdd = entity.cardId === CardIds.SoftHeartedSiren_BG26_590_G ? 2 : 1;
				const cardsToAdd = Array.from({ length: numbersOfCardsToAdd }).map(() => null);
				addCardsInHand(hero, board, cardsToAdd, gameState);
				entity.abiityChargesLeft--;
			}
			break;
		case CardIds.LongJohnCopper_BG29_831:
		case CardIds.LongJohnCopper_BG29_831_G:
			if (entity.abiityChargesLeft > 0) {
				const numbersOfCardsToAdd = entity.cardId === CardIds.LongJohnCopper_BG29_831_G ? 2 : 1;
				const cardsToAdd = Array.from({ length: numbersOfCardsToAdd }).map(() => null);
				addCardsInHand(hero, board, cardsToAdd, gameState);
				entity.abiityChargesLeft--;
			}
			break;
		case CardIds.BristlingBuffoon_BG29_160:
		case CardIds.BristlingBuffoon_BG29_160_G:
			if (entity.abiityChargesLeft > 0) {
				const numbersOfCardsToAdd = entity.cardId === CardIds.BristlingBuffoon_BG29_160_G ? 2 : 1;
				const cardsToAdd = Array.from({ length: numbersOfCardsToAdd }).map(() => CardIds.BloodGem);
				addCardsInHand(hero, board, cardsToAdd, gameState);
				entity.abiityChargesLeft--;
			}
			break;
	}

	handleOtherEntityEffects(entity, board, hero, otherBoard, otherHero, spawnedEntities, gameState);
	const finalSpawns = performEntitySpawns(
		spawnedEntities,
		board,
		hero,
		entity,
		board.length - (board.indexOf(entity) + 1),
		otherBoard,
		otherHero,
		gameState,
	);
	return finalSpawns;
};

const handleOtherEntityEffects = (
	entity: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	spawnedEntities: BoardEntity[],
	gameState: FullGameState,
) => {
	if (hasCorrectTribe(entity, Race.BEAST, gameState.allCards)) {
		board
			.filter(
				(e) =>
					e.cardId === CardIds.IridescentSkyblazer_BG29_806 ||
					e.cardId === CardIds.IridescentSkyblazer_BG29_806_G,
			)
			.forEach((e) => {
				const stats = e.cardId === CardIds.IridescentSkyblazer_BG29_806_G ? 2 : 1;
				const target = pickRandom(board.filter((e) => e.entityId !== entity.entityId));
				modifyAttack(target, stats, board, hero, gameState);
				modifyHealth(target, stats, board, hero, gameState);
				onStatsUpdate(target, board, hero, gameState);
				gameState.spectator.registerPowerTarget(e, target, board, hero, otherHero);
			});
		board
			.filter(
				(e) =>
					e.cardId === CardIds.TrigoreTheLasher_BG29_807 || e.cardId === CardIds.TrigoreTheLasher_BG29_807_G,
			)
			.filter((e) => e.entityId !== entity.entityId)
			.forEach((e) => {
				const stats = e.cardId === CardIds.TrigoreTheLasher_BG29_807_G ? 4 : 2;
				modifyHealth(e, stats, board, hero, gameState);
				onStatsUpdate(e, board, hero, gameState);
				gameState.spectator.registerPowerTarget(e, e, board, hero, otherHero);
			});
	}
};
