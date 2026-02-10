"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@moe/registry/ui/menubar";
import { View } from "react-native";
import { Text } from "@moe/registry/ui/text";

export default function MenubarPreview() {
  return (
    <View className="items-center justify-center p-10">
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger>
            <Text>File</Text>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              <Text>New Tab</Text>
              <MenubarShortcut>
                <Text>⌘T</Text>
              </MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              <Text>New Window</Text>
              <MenubarShortcut>
                <Text>⌘N</Text>
              </MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              <Text>Share</Text>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              <Text>Print...</Text>
              <MenubarShortcut>
                <Text>⌘P</Text>
              </MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger>
            <Text>Edit</Text>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              <Text>Undo</Text>
              <MenubarShortcut>
                <Text>⌘Z</Text>
              </MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              <Text>Redo</Text>
              <MenubarShortcut>
                <Text>⇧⌘Z</Text>
              </MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              <Text>Cut</Text>
            </MenubarItem>
            <MenubarItem>
              <Text>Copy</Text>
            </MenubarItem>
            <MenubarItem>
              <Text>Paste</Text>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </View>
  );
}
