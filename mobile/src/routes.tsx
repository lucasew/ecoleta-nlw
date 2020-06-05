import React from 'react'
import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'

import Home from './pages/Home'
import Points from './pages/Points'
import Detail from './pages/Detail'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'

const AppStack = createStackNavigator();

const Routes = () => {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{flex: 1}}>
                <NavigationContainer>
                    <AppStack.Navigator 
                        headerMode='none'
                        screenOptions={{
                            cardStyle: {
                                backgroundColor: '#f0f0f5'
                            }
                        }}
                    >
                        <AppStack.Screen name="Home" component={Home}/>
                        <AppStack.Screen name="Points" component={Points}/>
                        <AppStack.Screen name="Detail" component={Detail}/>
                    </AppStack.Navigator>
                </NavigationContainer>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default Routes