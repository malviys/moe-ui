import { Button } from "@moe-ui/registry/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@moe-ui/registry/components/ui/card";
import { Input } from "@moe-ui/registry/components/ui/input";
import { Label } from "@moe-ui/registry/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@moe-ui/registry/components/ui/tabs";
import { Text } from "@moe-ui/registry/components/ui/text";
import { View } from "react-native";

export default function TabsPreview() {
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
              Make changes to your account here. Click save when you’re done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <View className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Pedro Duarte" />
            </View>
            <View className="space-y-1">
              <Label htmlFor="username">Username</Label>
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
              Change your password here. After saving, you’ll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <View className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" secureTextEntry />
            </View>
            <View className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" secureTextEntry />
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
