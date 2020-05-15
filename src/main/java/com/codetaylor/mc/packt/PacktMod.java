package com.codetaylor.mc.packt;

import net.minecraft.resources.FolderPack;
import net.minecraft.resources.IResourcePack;
import net.minecraft.world.storage.WorldInfo;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.loading.FMLPaths;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/**
 * This mod uses ASM to inject a static method call directly before datapacks
 * are loaded, which it then uses to add a datapack located in the
 * instance/config/packt folder. The folder is created if it doesn't
 * exist.
 */
@Mod(PacktMod.ID)
public class PacktMod {

  public static final String ID = "packt";

  public static final Logger LOGGER = LogManager.getLogger();

  private static Path dataPath;

  public PacktMod() {

    dataPath = PacktMod.getConfigPath();

    try {
      Files.createDirectories(dataPath);

    } catch (IOException e) {
      LOGGER.error("", e);
    }
  }

  private static Path getConfigPath() {

    return FMLPaths.CONFIGDIR.get().resolve(PacktMod.ID);
  }

  /**
   * Called from the ASM injection site to add our data pack.
   * <pre>
   *    this.resourcePacks.getEnabledPacks().forEach((p_200244_1_) -> {
   * 		list1.add(p_200244_1_.getResourcePack());
   *    });
   * 	// ** BEGIN **
   * 	com.codetaylor.mc.packt.PactMod#onMinecraftServer$loadDataPacks(list1);
   * 	// ** END **
   * 	CompletableFuture<Unit> completablefuture = this.resourceManager.reloadResourcesAndThen(this.backgroundExecutor, this, list1, field_223713_i);
   * </pre>
   *
   * @param resourcePacks the list of {@link IResourcePack} data packs just about to be loaded
   * @see net.minecraft.server.MinecraftServer#loadDataPacks(WorldInfo)
   */
  @SuppressWarnings("unused")
  public static void onMinecraftServer$loadDataPacks(List<IResourcePack> resourcePacks) {

    LOGGER.info(String.format("Hooking data pack reload, adding to %d packs", resourcePacks.size()));
    resourcePacks.add(new FolderPack(dataPath.toFile()));
  }
}
