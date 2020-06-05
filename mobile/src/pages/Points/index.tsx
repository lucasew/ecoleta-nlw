import React, { useEffect, useState } from 'react'
import {View, StyleSheet, Text, TouchableOpacity, ScrollView, Image} from 'react-native'
import Constants from 'expo-constants'
import { useNavigation, useRoute } from '@react-navigation/native'
import MapView, {Marker} from 'react-native-maps'
import {SvgUri} from 'react-native-svg'
import BackButton from '../../components/BackButton'
import * as Location from 'expo-location'

import api, { ApiResponse, baseURL } from '../../services/api'

export interface Item {
  id: number
  title: string
  image: string
  is_selected: boolean
}

export interface Point {
  id: number
  image: string
  name: string
  email: string
  whatsapp: string
  city: string
  uf: string
  latitude: number
  longitude: number
  items: Item[]
}

interface RouteParams {
  city: string
  uf: string
}

const Points = () => {
  const route = useRoute()

  const [items, setItems] = useState<Item[]>([])
  const [points, setPoints] = useState<Point[]>([])

  const navigation = useNavigation()

  function handleNavigateToDetail(pointID: number) {
    navigation.navigate("Detail", {pointID})
  }

  useEffect(() => {
    async function loadPosition() {
      const {status} = await Location.requestPermissionsAsync()
      if (status !== 'granted') {
        return
      }
    }
    loadPosition()
  }, [])

  useEffect(() => {
    api.get<ApiResponse<Item[]>>('/api/items')
      .then(response => {
        const {error, data} = response.data
        if (error) {
          console.error(error)
          return
        }
        if (data) {
          setItems(data.map(item => {
            return {
              ...item,
              is_selected: false
            }
          }))
        }
      })
  }, [])

  useEffect(() => {
    api.get<ApiResponse<Point[]>>('/api/points', {
      params: {
        ...route.params,
        items: items
          .filter(item => item.is_selected)
          .map(item => item.id)
      }
    })
      .then(response => {
        const {data, error} = response.data
        if (error) {
          console.error(error)
          return
        } else {
          if (data) {
            setPoints(data)
          }
        }
      })
  }, [items])

  return (
    <>
      <View style={styles.container}>
        <BackButton />

        <Text style={styles.title}>Bem Vindo.</Text>
        <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

        <View style={styles.mapContainer}>
          <MapView 
            style={styles.map}
            showsUserLocation
          >
            {
              points.map(point => {
                return (
                <Marker 
                  key={point.id}
                  style={styles.mapMarker}
                  onPress={() => handleNavigateToDetail(point.id)}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude
                  }}
                >
                  <View style={styles.mapMarkerContainer}>
                    <Image 
                      style={styles.mapMarkerImage}
                      source={{
                        uri: 
                          point.image.startsWith('htt') 
                            ? point.image
                            : `${baseURL}/${point.image}`
                        
                      }} 
                    />
                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                  </View>
                </Marker>

              )
            })
          }
          </MapView>
        </View>
      </View>
      <View style={styles.itemsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20
          }}
        >
          {
            items.map(item => {
              return (
                <TouchableOpacity 
                  style={[styles.item, item.is_selected ? styles.selectedItem : {}]} 
                  onPress={() => {
                    setItems(items.map(stateItem => {
                      if (stateItem.id !== item.id) {
                        return stateItem
                      }
                      return {
                        ...stateItem,
                        is_selected: !stateItem.is_selected
                      }
                    }))
                  }}
                  key={item.id}
                  activeOpacity={0.6}
                >
                  <SvgUri 
                    width={42} 
                    height={42} 
                    uri={`${baseURL}${item.image}`} 
                  />
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </TouchableOpacity>
              )
            })
          }
        </ScrollView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
    textAlign: "center"
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});

export default Points