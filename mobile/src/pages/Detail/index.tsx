import React, {useEffect, useState} from 'react'
import {View, StyleSheet, Image, Text, Linking} from 'react-native'
import {useRoute, useNavigation} from '@react-navigation/native'
import {Feather ,FontAwesome} from '@expo/vector-icons'
import BackButton from '../../components/BackButton'
import { RectButton } from 'react-native-gesture-handler'
import { Point } from '../Points'
import * as MailComposer from 'expo-mail-composer'

import api, {ApiResponse, baseURL} from '../../services/api'

interface RouteParams {
  pointID: number | undefined
}

const Detail = () => {
  const navigator = useNavigation()
  const route = useRoute()

  const routeParams = route.params as RouteParams
  const {pointID} = routeParams
  if (pointID === undefined) {
    navigator.goBack()
    return
  }

  const [pointDetails, setPointDetails] = useState<Point>({
    name: "Carregando",
    id: pointID,
    email: "carregando...",
    whatsapp: '40028922',
    image: "https://s2.glbimg.com/vmo9jpOdJ51CkO8NMtjPK5RNIHg=/512x320/smart/e.glbimg.com/og/ed/f/original/2018/10/11/como-gastar-menos-no-mercado.jpg",
    items: [],
    latitude: 0,
    longitude: 0,
    city: "carregando...",
    uf: 'AC'
  })

  useEffect(() => {
    api.get<ApiResponse<Point>>(`/api/points/${pointID}`)
      .then(response => {
        const {data, error} = response.data
        if (error) {
          console.error(error)
          return 
        }
        if (data) {
          setPointDetails(data)
        }
      })
  }, [])

  function handleComposeMail() {
    MailComposer.composeAsync({
      subject: 'Ecoleta: Interesse no uso do ponto de coleta',
      recipients: [pointDetails.email],
    })
  }

  function handleWhatsApp() {
     Linking.openURL(`whatsapp://send?phone=${pointDetails.whatsapp}&text="Tenho interesse em utilizar o ponto de coleta ${pointDetails.name}"`)
  }

  return (
    <>
      <View style={styles.container}>
        <BackButton />

        <Image style={styles.pointImage} source={{
          uri: pointDetails.image.startsWith('htt')
            ? pointDetails.image
            : `${baseURL}/${pointDetails.image}`
        }}
        />

        <Text style={styles.pointName}>{pointDetails.name}</Text>
        <Text style={styles.pointItems}>
          {
            pointDetails.items
              .map(item => item.title)
              .join(", ")
          }
        </Text>
        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereço</Text>
          <Text style={styles.addressContent}>
            {pointDetails.city}, {pointDetails.uf.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleWhatsApp}>
          <FontAwesome name="whatsapp" size={20} color="#fff"/>
          <Text style={styles.buttonText}>WhatsApp</Text>
        </RectButton>
        <RectButton style={styles.button} onPress={handleComposeMail}>
          <Feather name="mail" size={20} color="#fff"/>
          <Text style={styles.buttonText}>E-mail</Text>
        </RectButton>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 20,
  },

  pointImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 32,
  },

  pointName: {
    color: '#322153',
    fontSize: 28,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  pointItems: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  address: {
    marginTop: 32,
  },
  
  addressTitle: {
    color: '#322153',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },

  addressContent: {
    fontFamily: 'Roboto_400Regular',
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  
  button: {
    width: '48%',
    backgroundColor: '#34CB79',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
  },
});

export default Detail