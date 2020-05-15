/**
 * This function is called by Forge before any minecraft classes are loaded to
 * setup the coremod.
 *
 * @return {object} All the transformers of this coremod.
 * @see https://github.com/Cadiboo/NoCubes/blob/1.14.x/src/main/resources/nocubes-transformer.js
 * @see https://cadiboo.github.io/tutorials/1.14.4/forge/99.99-coremod/
 */
function initializeCoreMod() {
  /*Class/Interface*/ Opcodes = Java.type("org.objectweb.asm.Opcodes");
  /*Class*/ ASMAPI = Java.type("net.minecraftforge.coremod.api.ASMAPI");

  /*Class*/ InsnList = Java.type("org.objectweb.asm.tree.InsnList");

  /*Class*/ AbstractInsnNode = Java.type("org.objectweb.asm.tree.AbstractInsnNode");
  /*Class*/ InsnNode = Java.type("org.objectweb.asm.tree.InsnNode");
  /*Class*/ VarInsnNode = Java.type("org.objectweb.asm.tree.VarInsnNode");
  /*Class*/ MethodInsnNode = Java.type("org.objectweb.asm.tree.MethodInsnNode");

  LABEL = AbstractInsnNode.LABEL;

  return {
    "MinecraftServer#loadDataPacks": {
      target: {
        /*
        MC 1.14.4: net/minecraft/server/MinecraftServer.loadDataPacks
        Name: b => func_195568_a => loadDataPacks
        Comment: None
        Side: BOTH
        AT: public net.minecraft.server.MinecraftServer func_195568_a(Lnet/minecraft/world/storage/WorldInfo;)V # loadDataPacks
        */
        type: "METHOD",
        class: "net.minecraft.server.MinecraftServer",
        methodName: "func_195568_a",
        methodDesc: "(Lnet/minecraft/world/storage/WorldInfo;)V",
      },
      transformer: function (methodNode) {
        inject(methodNode.instructions);
        return methodNode;
      },
    },
  };
}

// 1) Find INVOKEINTERFACE net/minecraft/resources/IReloadableResourceManager.reloadResourcesAndThen (Ljava/util/concurrent/Executor;Ljava/util/concurrent/Executor;Ljava/util/List;Ljava/util/concurrent/CompletableFuture;)Ljava/util/concurrent/CompletableFuture; (itf)
// 2) Find the first label before
// 3) Inject after the label

// Java
/*
	this.resourcePacks.getEnabledPacks().forEach((p_200244_1_) -> {
		list1.add(p_200244_1_.getResourcePack());
	});
	// ** BEGIN **
	com.codetaylor.mc.packt.PacktMod#onMinecraftServer$loadDataPacks(list1);
	// ** END **
	CompletableFuture<Unit> completablefuture = this.resourceManager.reloadResourcesAndThen(this.backgroundExecutor, this, list1, field_223713_i);
*/

// Bytecode
/*
L12
  LINENUMBER 1434 L12
  ALOAD 0
  GETFIELD net/minecraft/server/MinecraftServer.resourcePacks : Lnet/minecraft/resources/ResourcePackList;
  INVOKEVIRTUAL net/minecraft/resources/ResourcePackList.getEnabledPacks ()Ljava/util/Collection;
  ALOAD 3
  INVOKEDYNAMIC accept(Ljava/util/List;)Ljava/util/function/Consumer; [
    // handle kind 0x6 : INVOKESTATIC
    java/lang/invoke/LambdaMetafactory.metafactory(Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invoke/MethodType;)Ljava/lang/invoke/CallSite;
    // arguments:
    (Ljava/lang/Object;)V, 
    // handle kind 0x6 : INVOKESTATIC
    net/minecraft/server/MinecraftServer.lambda$loadDataPacks$9(Ljava/util/List;Lnet/minecraft/resources/ResourcePackInfo;)V, 
    (Lnet/minecraft/resources/ResourcePackInfo;)V
  ]
  INVOKEINTERFACE java/util/Collection.forEach (Ljava/util/function/Consumer;)V (itf)
L13
	// ** BEGIN **
	ALOAD 3
	INVOKESTATIC com/codetaylor/mc/packt/PacktMod.onMinecraftServer$loadDataPacks (Ljava/util/List;)V
	// ** END **
  LINENUMBER 1437 L13
  ALOAD 0
  GETFIELD net/minecraft/server/MinecraftServer.resourceManager : Lnet/minecraft/resources/IReloadableResourceManager;
  ALOAD 0
  GETFIELD net/minecraft/server/MinecraftServer.backgroundExecutor : Ljava/util/concurrent/Executor;
  ALOAD 0
  ALOAD 3
  GETSTATIC net/minecraft/server/MinecraftServer.field_223713_i : Ljava/util/concurrent/CompletableFuture;
  INVOKEINTERFACE net/minecraft/resources/IReloadableResourceManager.reloadResourcesAndThen (Ljava/util/concurrent/Executor;Ljava/util/concurrent/Executor;Ljava/util/List;Ljava/util/concurrent/CompletableFuture;)Ljava/util/concurrent/CompletableFuture; (itf)
  ASTORE 4
*/

/*
MC 1.14.4: net/minecraft/resources/IReloadableResourceManager.reloadResourcesAndThen
Name: a => func_219536_a => reloadResourcesAndThen
Comment: None
Side: BOTH
AT: public net.minecraft.resources.IReloadableResourceManager func_219536_a(Ljava/util/concurrent/Executor;Ljava/util/concurrent/Executor;Ljava/util/List;Ljava/util/concurrent/CompletableFuture;)Ljava/util/concurrent/CompletableFuture; # reloadResourcesAndThen	
*/

function inject(instructions) {

  var reloadResourcesAndThen_name = ASMAPI.mapMethod("func_219536_a"); // IReloadableResourceManager.reloadResourcesAndThen
  var first_INVOKEINTERFACE_reloadResourcesAndThen;
	var arrayLength = instructions.size();
	
  for (var i = 0; i < arrayLength; ++i) {
    var instruction = instructions.get(i);
    if (instruction.getOpcode() == Opcodes.INVOKEINTERFACE) {
      if (instruction.owner == "net/minecraft/resources/IReloadableResourceManager") {
        if (instruction.name == reloadResourcesAndThen_name) {
          if (instruction.desc == "(Ljava/util/concurrent/Executor;Ljava/util/concurrent/Executor;Ljava/util/List;Ljava/util/concurrent/CompletableFuture;)Ljava/util/concurrent/CompletableFuture;") {
            if (instruction.itf == true) {
              first_INVOKEINTERFACE_reloadResourcesAndThen = instruction;
              print('Found injection point "IReloadableResourceManager.reloadResourcesAndThen" ' + instruction);
              break;
            }
          }
        }
      }
    }
	}
	
	if (!first_INVOKEINTERFACE_reloadResourcesAndThen) {
		throw "Error: Couldn't find injection point \"IReloadableResourceManager.reloadResourcesAndThen\"! " + instructions;
	}

	var firstLabelBefore_first_INVOKEINTERFACE_reloadResourcesAndThen;
	for (i = instructions.indexOf(first_INVOKEINTERFACE_reloadResourcesAndThen); i >= 0; --i) {
		var instruction = instructions.get(i);
		if (instruction.getType() == LABEL) {
			firstLabelBefore_first_INVOKEINTERFACE_reloadResourcesAndThen = instruction;
			print("Found label \"firstLabelBefore_first_INVOKEINTERFACE_reloadResourcesAndThen\" " + instruction);
			break;
		}
	}

	if (!firstLabelBefore_first_INVOKEINTERFACE_reloadResourcesAndThen) {
		throw "Error: Couldn't find label \"firstLabelBefore_first_INVOKEINTERFACE_reloadResourcesAndThen\"!";
	}

	var toInject = new InsnList();

	toInject.add(new VarInsnNode(Opcodes.ALOAD, 3)); // list1
	toInject.add(new MethodInsnNode(
		//int opcode
		Opcodes.INVOKESTATIC,
		//String owner
		"com/codetaylor/mc/packt/PacktMod",
		//String name
		"onMinecraftServer$loadDataPacks",
		//String descriptor
		"(Ljava/util/List;)V",
		//boolean isInterface
		false
	));

	instructions.insert(firstLabelBefore_first_INVOKEINTERFACE_reloadResourcesAndThen, toInject);
}
