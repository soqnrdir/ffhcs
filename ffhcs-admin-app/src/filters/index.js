import moment from 'moment'

// filter usage example: https://stackoverflow.com/a/47005707
export default {
     install(Vue) {
        Vue.filter('localdatetime', value => value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '')
        Vue.filter('tofixed', value => value ? Number(value.toFixed(2)) : null)
    }
}
