import { Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasAfterDealDamage, hasOnDamaged } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { updateDivineShield } from '../keywords/divine-shield';
import { CardIds } from '../services/card-ids';
import { pickRandom, pickRandomAlive } from '../services/utils';
import { grantStatsToMinionsOfEachType, hasCorrectTribe } from '../utils';
import { spawnEntities } from './deathrattle-spawns';
import { applyFrenzy } from './frenzy';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';
import { modifyStats } from './stats';

export const onEntityDamaged = (
	damagedEntity: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	damageSource: BoardEntity | BgsPlayerEntity,
	damage: number,
	gameState: FullGameState,
): readonly BoardEntity[] => {
	const spawnedEntities: BoardEntity[] = [];
	const friendlyBoard =
		board?.[0]?.friendly === damagedEntity.friendly
			? board
			: otherBoard?.[0]?.friendly === damagedEntity.friendly
			? otherBoard
			: [];
	const enemyBoard =
		board?.[0]?.friendly === damagedEntity.friendly
			? otherBoard
			: board?.[0]?.friendly === damagedEntity.friendly
			? board
			: [];
	const friendlyHero = friendlyBoard === board ? hero : otherHero;
	const enemyHero = friendlyBoard === board ? otherHero : hero;

	if (damagedEntity.frenzyChargesLeft > 0 && damagedEntity.health > 0 && !damagedEntity.definitelyDead) {
		applyFrenzy(damagedEntity, friendlyBoard, friendlyHero, gameState);
		damagedEntity.frenzyChargesLeft--;
	}

	const wheneverDamagedImpl = cardMappings[damagedEntity.cardId];
	if (hasOnDamaged(wheneverDamagedImpl)) {
		wheneverDamagedImpl.onDamaged(damagedEntity, {
			damagedEntity: damagedEntity,
			damageDealer: damageSource,
			damage: damage,
			board: friendlyBoard,
			hero: friendlyHero,
			otherHero: enemyHero,
			gameState,
		});
	}

	switch (damagedEntity.cardId) {
		case CardIds.WingedChimera_BG29_844:
		case CardIds.WingedChimera_BG29_844_G:
			if (damagedEntity.abiityChargesLeft > 0) {
				const wingedChimeraModifier = damagedEntity.cardId === CardIds.WingedChimera_BG29_844_G ? 2 : 1;
				grantStatsToMinionsOfEachType(
					damagedEntity,
					friendlyBoard,
					friendlyHero,
					wingedChimeraModifier * 1,
					wingedChimeraModifier * 1,
					gameState,
				);
				damagedEntity.abiityChargesLeft--;
			}
			break;
		case CardIds.Untameabull_BG29_878:
		case CardIds.Untameabull_BG29_878_G:
			updateDivineShield(damagedEntity, friendlyBoard, friendlyHero, enemyHero, true, gameState);
			gameState.spectator.registerPowerTarget(
				damagedEntity,
				damagedEntity,
				friendlyBoard,
				friendlyHero,
				enemyHero,
			);
			break;
		case CardIds.TrustyPup_BG29_800:
		case CardIds.TrustyPup_BG29_800_G:
			const trustyPupStats = damagedEntity.cardId === CardIds.TrustyPup_BG29_800_G ? 2 : 1;
			modifyStats(damagedEntity, damagedEntity, trustyPupStats, 0, friendlyBoard, friendlyHero, gameState);
			break;
		case CardIds.SilverGoose_BG29_801:
		case CardIds.SilverGoose_BG29_801_G:
			spawnedEntities.push(
				...spawnEntities(
					damagedEntity.cardId === CardIds.SilverGoose_BG29_801_G
						? CardIds.SilverGoose_SilverFledglingToken_BG29_801_Gt
						: CardIds.SilverGoose_SilverFledglingToken_BG29_801t,
					1,
					friendlyBoard,
					friendlyHero,
					enemyBoard,
					enemyHero,
					gameState,
					damagedEntity.friendly,
					false,
				),
			);
			break;
	}

	handleOtherEntityEffects(
		damagedEntity,
		friendlyBoard,
		friendlyHero,
		enemyBoard,
		enemyHero,
		spawnedEntities,
		gameState,
	);
	const finalSpawns = performEntitySpawns(
		spawnedEntities,
		friendlyBoard,
		friendlyHero,
		damagedEntity,
		friendlyBoard.length - (friendlyBoard.indexOf(damagedEntity) + 1),
		enemyBoard,
		enemyHero,
		gameState,
	);

	const entityRightToSpawns = friendlyBoard[friendlyBoard.indexOf(damagedEntity) + 1];
	finalSpawns.forEach((e) => {
		e.hasAttacked = damagedEntity.hasAttacked > 1 ? 1 : entityRightToSpawns?.hasAttacked ?? undefined;
	});

	if (damage > 0) {
		for (const entity of friendlyBoard) {
			const afterDealDamageImpl = cardMappings[entity.cardId];
			if (hasAfterDealDamage(afterDealDamageImpl)) {
				afterDealDamageImpl.afterDealDamage(entity, {
					damagedEntity: damagedEntity,
					damageDealer: damageSource,
					damage: damage,
					board: friendlyBoard,
					hero: friendlyHero,
					gameState,
				});
			}
		}
		for (const entity of enemyBoard) {
			const afterDealDamageImpl = cardMappings[entity.cardId];
			if (hasAfterDealDamage(afterDealDamageImpl)) {
				afterDealDamageImpl.afterDealDamage(entity, {
					damagedEntity: damagedEntity,
					damageDealer: damageSource,
					damage: damage,
					board: enemyBoard,
					hero: enemyHero,
					gameState,
				});
			}
		}
	}
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
	if (hasCorrectTribe(entity, hero, Race.BEAST, gameState.anomalies, gameState.allCards)) {
		board
			.filter(
				(e) =>
					e.cardId === CardIds.IridescentSkyblazer_BG29_806 ||
					e.cardId === CardIds.IridescentSkyblazer_BG29_806_G,
			)
			.forEach((e) => {
				const stats = e.cardId === CardIds.IridescentSkyblazer_BG29_806_G ? 2 : 1;
				const target = pickRandom(board.filter((e) => e.entityId !== entity.entityId));
				if (!!target) {
					modifyStats(target, e, 2 * stats, 1 * stats, board, hero, gameState);
				}
			});
		board
			.filter(
				(e) =>
					e.cardId === CardIds.TrigoreTheLasher_BG29_807 || e.cardId === CardIds.TrigoreTheLasher_BG29_807_G,
			)
			.filter((e) => e.entityId !== entity.entityId)
			.forEach((e) => {
				const stats = e.cardId === CardIds.TrigoreTheLasher_BG29_807_G ? 2 : 1;
				modifyStats(e, e, 0, 2 * stats, board, hero, gameState);
			});
	}

	hero.trinkets
		.filter(
			(t) =>
				t.cardId === CardIds.TigerCarving_BG30_MagicItem_427 ||
				t.cardId === CardIds.TigerCarving_TigerCarvingToken_BG30_MagicItem_427t,
		)
		.forEach((carving) => {
			const target = pickRandomAlive(board);
			if (!!target) {
				const buff = carving.cardId === CardIds.TigerCarving_TigerCarvingToken_BG30_MagicItem_427t ? 4 : 2;
				modifyStats(target, carving, buff, 0, board, hero, gameState);
			}
		});
};

export interface AfterDealDamageInput {
	damagedEntity: BoardEntity | BgsPlayerEntity;
	damageDealer: BoardEntity | BgsPlayerEntity;
	damage: number;
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	gameState: FullGameState;
}
