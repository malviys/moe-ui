import dynamic from "next/dynamic";

export const examples = {
  "accordion-preview": dynamic(
    () => import("@/components/preview/accordion-preview"),
  ),
  "alert-preview": dynamic(() => import("@/components/preview/alert-preview")),
  "avatar-preview": dynamic(
    () => import("@/components/preview/avatar-preview"),
  ),
  "badge-preview": dynamic(() => import("@/components/preview/badge-preview")),
  "button-preview": dynamic(
    () => import("@/components/preview/button-preview"),
  ),
  "card-preview": dynamic(() => import("@/components/preview/card-preview")),
  "checkbox-preview": dynamic(
    () => import("@/components/preview/checkbox-preview"),
  ),
  "collapsible-preview": dynamic(
    () => import("@/components/preview/collapsible-preview"),
  ),
  "dialog-preview": dynamic(
    () => import("@/components/preview/dialog-preview"),
  ),
  "dropdown-menu-preview": dynamic(
    () => import("@/components/preview/dropdown-menu-preview"),
  ),
  "hover-card-preview": dynamic(
    () => import("@/components/preview/hover-card-preview"),
  ),
  "input-preview": dynamic(() => import("@/components/preview/input-preview")),
  "label-preview": dynamic(() => import("@/components/preview/label-preview")),
  "popover-preview": dynamic(
    () => import("@/components/preview/popover-preview"),
  ),
  "progress-preview": dynamic(
    () => import("@/components/preview/progress-preview"),
  ),
  "radio-group-preview": dynamic(
    () => import("@/components/preview/radio-group-preview"),
  ),
  "select-preview": dynamic(
    () => import("@/components/preview/select-preview"),
  ),
  "separator-preview": dynamic(
    () => import("@/components/preview/separator-preview"),
  ),
  "sheet-preview": dynamic(() => import("@/components/preview/sheet-preview")),
  "skeleton-preview": dynamic(
    () => import("@/components/preview/skeleton-preview"),
  ),
  "switch-preview": dynamic(
    () => import("@/components/preview/switch-preview"),
  ),
  "tabs-preview": dynamic(() => import("@/components/preview/tabs-preview")),
  "text-preview": dynamic(() => import("@/components/preview/text-preview")),
  "textarea-preview": dynamic(
    () => import("@/components/preview/textarea-preview"),
  ),
  "toggle-preview": dynamic(
    () => import("@/components/preview/toggle-preview"),
  ),
  "toggle-group-preview": dynamic(
    () => import("@/components/preview/toggle-group-preview"),
  ),
  "alert-dialog-preview": dynamic(
    () => import("@/components/preview/alert-dialog-preview"),
  ),
  "aspect-ratio-preview": dynamic(
    () => import("@/components/preview/aspect-ratio-preview"),
  ),
  "tooltip-preview": dynamic(
    () => import("@/components/preview/tooltip-preview"),
  ),
};

export const code = {
  "aspect-ratio-preview": `"use client";

import { AspectRatio } from "@moe/registry/ui/aspect-ratio";
import { Image, View } from "react-native";

export default function AspectRatioPreview() {
  return (
    <View className="w-[300px]">
      <AspectRatio ratio={16 / 9}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80",
          }}
          style={{ width: "100%", height: "100%", borderRadius: 8 }}
          resizeMode="cover"
        />
      </AspectRatio>
    </View>
  );
}
`,
  "alert-dialog-preview": `"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@moe/registry/ui/alert-dialog";
import { Button } from "@moe/registry/ui/button";
import { Text } from "@moe/registry/ui/text";

export default function AlertDialogPreview() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Text>Show Dialog</Text>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction>
            <Text>Continue</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
`,
  "accordion-preview": `import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@moe/registry/ui/accordion";
import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";

export function AccordionPreview() {
  return (
    <View className="p-6">
      <Accordion
        type="multiple"
        collapsible
        defaultValue={["item-1"]}
        className="w-full max-w-sm"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <Text>Is it accessible?</Text>
          </AccordionTrigger>
          <AccordionContent>
            <Text>Yes. It adheres to the WAI-ARIA design pattern.</Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <Text>Is it styled?</Text>
          </AccordionTrigger>
          <AccordionContent>
            <Text>
              Yes. It comes with default styles that matches the other components'
              aesthetic.
            </Text>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>
            <Text>Is it animated?</Text>
          </AccordionTrigger>
          <AccordionContent>
            <Text>
              Yes. It's animated by default, but you can disable it if you
              prefer.
            </Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </View>
  );
}
`,
  "alert-preview": `import { Alert, AlertDescription, AlertTitle } from "@moe/registry/ui/alert";
import { Terminal } from "@/lib/icons/Terminal";
import { View } from "react-native";

export function AlertPreview() {
  return (
    <View className="max-w-xl justify-center p-6 bg-background">
      <Alert icon={Terminal}>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components to your app using the cli.
        </AlertDescription>
      </Alert>
    </View>
  );
}
`,
  "avatar-preview": `import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@moe/registry/ui/avatar";
import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";

export function AvatarPreview() {
  return (
    <View className="items-center justify-center gap-4 p-6">
      <Avatar alt="Zach Nugent's Avatar">
        <AvatarImage source={{ uri: "https://github.com/mrzachnugent.png" }} />
        <AvatarFallback>
          <Text>ZN</Text>
        </AvatarFallback>
      </Avatar>
    </View>
  );
}
`,
  "badge-preview": `import { Badge } from "@moe/registry/ui/badge";
import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";

export function BadgePreview() {
  return (
    <View className="flex-1 justify-center items-center">
      <Badge>
        <Text>Badge</Text>
      </Badge>
    </View>
  );
}
`,
  "button-preview": `import { Button } from "@moe/registry/ui/button";
import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";

export function ButtonPreview() {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <Button>
        <Text>Button</Text>
      </Button>
    </View>
  );
}
`,
  "card-preview": `import { Button } from "@moe/registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@moe/registry/ui/card";
import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";

export function CardPreview() {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>Card Content</Text>
        </CardContent>
        <CardFooter>
          <Text>Card Footer</Text>
        </CardFooter>
      </Card>
    </View>
  );
}
`,
  "checkbox-preview": `import { Checkbox } from "@moe/registry/ui/checkbox";
import { Label } from "@moe/registry/ui/label";
import { View } from "react-native";

export function CheckboxPreview() {
  const [checked, setChecked] = React.useState(false);

  return (
    <View className="flex-1 justify-center items-center p-6 gap-2">
      <View className="flex-row items-center gap-2">
        <Checkbox
          id="terms"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <Label nativeID="terms" onPress={() => setChecked(!checked)}>
          Accept terms and conditions
        </Label>
      </View>
    </View>
  );
}
`,
  "collapsible-preview": `import { Button } from "@moe/registry/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@moe/registry/ui/collapsible";
import { Text } from "@moe/registry/ui/text";
import * as React from "react";
import { View } from "react-native";
import { ChevronsUpDown } from "@/lib/icons/ChevronsUpDown";

export function CollapsiblePreview() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-[350px] space-y-2"
    >
      <View className="flex flex-row items-center justify-between space-x-4 px-4">
        <Text className="text-sm font-semibold">
          @peduarte starred 3 repositories
        </Text>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <Text className="sr-only">Toggle</Text>
          </Button>
        </CollapsibleTrigger>
      </View>
      <View className="rounded-md border px-4 py-3 font-mono text-sm">
        <Text>@radix-ui/primitives</Text>
      </View>
      <CollapsibleContent className="space-y-2">
        <View className="rounded-md border px-4 py-3 font-mono text-sm">
          <Text>@radix-ui/colors</Text>
        </View>
        <View className="rounded-md border px-4 py-3 font-mono text-sm">
          <Text>@stitches/react</Text>
        </View>
      </CollapsibleContent>
    </Collapsible>
  );
}
`,
  "dialog-preview": `import { Button } from "@moe/registry/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@moe/registry/ui/dialog";
import { Input } from "@moe/registry/ui/input";
import { Label } from "@moe/registry/ui/label";
import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";

export function DialogPreview() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Text>Edit Profile</Text>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <View className="grid gap-4 py-4">
          <View className="grid grid-cols-4 items-center gap-4">
            <Label nativeID="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
          </View>
          <View className="grid grid-cols-4 items-center gap-4">
            <Label nativeID="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3"
            />
          </View>
        </View>
        <DialogFooter>
          <Button type="submit">
            <Text>Save changes</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
`,
  "dropdown-menu-preview": `import { Button } from "@moe/registry/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@moe/registry/ui/dropdown-menu";
import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";

export function DropdownMenuPreview() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Text>Open</Text>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Text>Profile</Text>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Text>Billing</Text>
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Text>Settings</Text>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Text>Keyboard shortcuts</Text>
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Text>Team</Text>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Text>Invite users</Text>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <Text>Email</Text>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Text>Message</Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Text>More...</Text>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <Text>New Team</Text>
            <DropdownMenuItem>⇧⌘T</DropdownMenuItem>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Text>GitHub</Text>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Text>Support</Text>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Text>API</Text>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Text>Log out</Text>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
`,
  "hover-card-preview": `import { Avatar, AvatarFallback, AvatarImage } from "@moe/registry/ui/avatar";
import { Button } from "@moe/registry/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@moe/registry/ui/hover-card";
import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";
import { CalendarDays } from "@/lib/icons/CalendarDays";

export function HoverCardPreview() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">
          <Text>@nextjs</Text>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <View className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage source={{ uri: "https://github.com/vercel.png" }} />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <View className="space-y-1">
            <Text className="text-sm font-semibold">@nextjs</Text>
            <Text className="text-sm">
              The React Framework – created and maintained by @vercel.
            </Text>
            <View className="flex items-center pt-2">
              <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
              <Text className="text-xs text-muted-foreground">
                Joined December 2021
              </Text>
            </View>
          </View>
        </View>
      </HoverCardContent>
    </HoverCard>
  );
}
`,
  "input-preview": `import { Input } from "@moe/registry/ui/input";
import { View } from "react-native";

export function InputPreview() {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <Input
        placeholder="Email"
        className="max-w-xs"
      />
    </View>
  );
}
`,
  "label-preview": `import { Checkbox } from "@moe/registry/ui/checkbox";
import { Label } from "@moe/registry/ui/label";
import { View } from "react-native";

export function LabelPreview() {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <View className="flex-row items-center gap-2">
        <Checkbox id="terms" />
        <Label nativeID="terms">Accept terms and conditions</Label>
      </View>
    </View>
  );
}
`,
  "popover-preview": `import { Button } from "@moe/registry/ui/button";
import { Input } from "@moe/registry/ui/input";
import { Label } from "@moe/registry/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@moe/registry/ui/popover";
import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";

export function PopoverPreview() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Text>Open popover</Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <View className="grid gap-4">
          <View className="space-y-2">
            <Text className="font-medium leading-none">Dimensions</Text>
            <Text className="text-muted-foreground text-sm">
              Set the dimensions for the layer.
            </Text>
          </View>
          <View className="grid gap-2">
            <View className="grid grid-cols-3 items-center gap-4">
              <Label nativeID="width">Width</Label>
              <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
            </View>
            <View className="grid grid-cols-3 items-center gap-4">
              <Label nativeID="maxWidth">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
              />
            </View>
            <View className="grid grid-cols-3 items-center gap-4">
              <Label nativeID="height">Height</Label>
              <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
            </View>
            <View className="grid grid-cols-3 items-center gap-4">
              <Label nativeID="maxHeight">Max. height</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8"
              />
            </View>
          </View>
        </View>
      </PopoverContent>
    </Popover>
  );
}
`,
  "progress-preview": `import * as React from "react";
import { Progress } from "@moe/registry/ui/progress";
import { View } from "react-native";

export function ProgressPreview() {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="w-full max-w-sm p-6">
      <Progress value={progress} className="w-[60%]" />
    </View>
  );
}
`,
  "radio-group-preview": `import { Label } from "@moe/registry/ui/label";
import { RadioGroup, RadioGroupItem } from "@moe/registry/ui/radio-group";
import { View } from "react-native";

export function RadioGroupPreview() {
  return (
    <RadioGroup defaultValue="comfortable">
      <View className="flex-row items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <Label nativeID="r1">Default</Label>
      </View>
      <View className="flex-row items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label nativeID="r2">Comfortable</Label>
      </View>
      <View className="flex-row items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <Label nativeID="r3">Compact</Label>
      </View>
    </RadioGroup>
  );
}
`,
  "select-preview": `import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@moe/registry/ui/select";
import { View } from "react-native";

export function SelectPreview() {
  return (
    <View className="w-[180px]">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes">Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
}
`,
  "separator-preview": `import { Separator } from "@moe/registry/ui/separator";
import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";

export function SeparatorPreview() {
  return (
    <View>
      <View className="space-y-1">
        <Text className="text-sm font-medium leading-none">Radix Primitives</Text>
        <Text className="text-sm text-muted-foreground">
          An open-source UI component library.
        </Text>
      </View>
      <Separator className="my-4" />
      <View className="flex h-5 items-center space-x-4 text-sm">
        <Text>Blog</Text>
        <Separator orientation="vertical" />
        <Text>Docs</Text>
        <Separator orientation="vertical" />
        <Text>Source</Text>
      </View>
    </View>
  );
}
`,
  "sheet-preview": `import { Button } from "@moe/registry/ui/button";
import { Input } from "@moe/registry/ui/input";
import { Label } from "@moe/registry/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@moe/registry/ui/sheet";
import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";

export function SheetPreview() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Text>Open</Text>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <View className="grid gap-4 py-4">
          <View className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
          </View>
          <View className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" defaultValue="@peduarte" className="col-span-3" />
          </View>
        </View>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">
              <Text>Save changes</Text>
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
`,
  "skeleton-preview": `import { Skeleton } from "@moe/registry/ui/skeleton";
import { View } from "react-native";

export function SkeletonPreview() {
  return (
    <View className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <View className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </View>
    </View>
  );
}
`,
  "switch-preview": `import { Label } from "@moe/registry/ui/label";
import { Switch } from "@moe/registry/ui/switch";
import { View } from "react-native";

export function SwitchPreview() {
  return (
    <View className="flex-row items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label nativeID="airplane-mode">Airplane Mode</Label>
    </View>
  );
}
`,
  "tabs-preview": `import { Button } from "@moe/registry/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@moe/registry/ui/card";
import { Input } from "@moe/registry/ui/input";
import { Label } from "@moe/registry/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@moe/registry/ui/tabs";
import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";

export function TabsPreview() {
  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">
          <Text>Account</Text>
        </TabsTrigger>
        <TabsTrigger value="password">
          <Text>Password</Text>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <View className="space-y-1">
              <Label nativeID="name">Name</Label>
              <Input id="name" defaultValue="Pedro Duarte" />
            </View>
            <View className="space-y-1">
              <Label nativeID="username">Username</Label>
              <Input id="username" defaultValue="@peduarte" />
            </View>
          </CardContent>
          <CardFooter>
            <Button>
              <Text>Save changes</Text>
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <View className="space-y-1">
              <Label nativeID="current">Current password</Label>
              <Input id="current" type="password" />
            </View>
            <View className="space-y-1">
              <Label nativeID="new">New password</Label>
              <Input id="new" type="password" />
            </View>
          </CardContent>
          <CardFooter>
            <Button>
              <Text>Save password</Text>
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
`,
  "text-preview": `import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";

export function TextPreview() {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <Text>Hello World</Text>
    </View>
  );
}
`,
  "textarea-preview": `import { Textarea } from "@moe/registry/ui/textarea";
import { View } from "react-native";

export function TextareaPreview() {
  return (
    <View className="flex-1 justify-center items-center p-6 bg-background">
      <Textarea placeholder="Type your message here." />
    </View>
  );
}
`,
  "toggle-preview": `import { Toggle } from "@moe/registry/ui/toggle";
import { View } from "react-native";
import { Bold } from "@/lib/icons/Bold";

export function TogglePreview() {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <Toggle aria-label="Toggle bold">
        <Bold className="h-4 w-4 text-foreground" />
      </Toggle>
    </View>
  );
}
`,
  "toggle-group-preview": `import {
  ToggleGroup,
  ToggleGroupItem,
} from "@moe/registry/ui/toggle-group";
import { View } from "react-native";
import { Bold } from "@/lib/icons/Bold";
import { Italic } from "@/lib/icons/Italic";
import { Underline } from "@/lib/icons/Underline";

export function ToggleGroupPreview() {
  return (
    <ToggleGroup type="multiple">
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Bold className="h-4 w-4 text-foreground" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Italic className="h-4 w-4 text-foreground" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="strikethrough"
        aria-label="Toggle strikethrough"
      >
        <Underline className="h-4 w-4 text-foreground" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
`,
  "tooltip-preview": `import { Button } from "@moe/registry/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@moe/registry/ui/tooltip";
import { Text } from "@moe/registry/ui/text";

export function TooltipPreview() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">
          <Text>Hover</Text>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <Text>Add to library</Text>
      </TooltipContent>
    </Tooltip>
  );
}
`,
};
