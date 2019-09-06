<template>
  <div>
    <h1>{{ $t('pageGroupsTitle') }}</h1>
    <hr />
    <GroupsTable ref="groupsTable"
                 v-on:group-selected="onGroupSelected"
                 v-on:on-group-edit-clicked="onGroupEditClicked"
                 v-on:on-group-delete-clicked="onGroupDeleteClicked" />

    <div v-if="group">
      <h2>{{ group.groupName }} <small>{{ groupTypes[group.groupType].text() }}</small></h2>
      <template v-if="group.groupDescription">
        <h3>{{ $t('pageGroupsDescriptionTitle') }}</h3>
        <p>{{ group.groupDescription }}</p>
      </template>

      <h3>{{ $t('pageGroupsVisibilityTitle') }}</h3>
      <span>{{ $t('pageGroupsVisibilityText') }}</span>
      <b-form-checkbox switch
                       v-model="group.groupVisibility"
                       :value="true"
                       :disabled="userCanEdit === false"
                       :unchecked-value="false"
                       @change="onUpdateGroupVisibility">
        {{ group.groupVisibility === 1 ? $t('genericYes') : $t('genericNo') }}
      </b-form-checkbox>

      <h3>{{ $t('pageGroupsMembersTitle') }}</h3>
      <!-- One of these three tables will be shown, depending on the type of the selected group -->
      <GermplasmTable v-if="group.groupType === 'germinatebase'"
                      ref="groupmembersTable"
                      :getData="getGermplasmData"
                      :getIds="getGermplasmIds"
                      :selectable="userCanEdit && serverSettings.authMode !== 'NONE'"
                      :tableActions="userCanEdit ? tableActions : null"/>
      <MarkerTable v-else-if="group.groupType === 'markers'"
                   ref="groupmembersTable"
                   :getData="getMarkerData"
                   :getIds="getMarkerIds"
                   :selectable="userCanEdit && serverSettings.authMode !== 'NONE'"
                   :tableActions="userCanEdit ? tableActions : null"/>
      <LocationsTable v-else-if="group.groupType === 'locations'"
                     ref="groupmembersTable"
                     :getData="getLocationData"
                     :getIds="getLocationIds"
                     :selectable="userCanEdit && serverSettings.authMode !== 'NONE'"
                     :tableActions="userCanEdit ? tableActions : null"/>
    </div>

    <GroupEditAddModal ref="groupDetailsModal"
                       :groupToEdit="groupToEdit"
                       :groupTypeSelect="groupTypeSelect"
                       v-on:ok="onEditGroup" />
  </div>
</template>

<script>
import GermplasmTable from '@/components/tables/GermplasmTable'
import GroupsTable from '@/components/tables/GroupsTable'
import LocationsTable from '@/components/tables/LocationsTable'
import MarkerTable from '@/components/tables/MarkerTable'
import GroupEditAddModal from '@/components/modals/GroupEditAddModal'

export default {
  data: function () {
    return {
      group: null,
      groupToEdit: null,
      groupId: null,
      groupTypeSelect: [],
      tableActions: [
        {
          id: 0,
          text: this.$t('buttonDelete'),
          variant: 'outline-danger',
          icon: 'mdi mdi-18px mdi-delete',
          callback: (selectedIds) => {
            const data = {
              ids: selectedIds,
              isAddition: false
            }
            this.apiPatchGroupMembers(this.group.groupId, this.groupTypes[this.group.groupType].apiName, data, result => {
              this.$refs.groupmembersTable.refresh()
              this.$refs.groupsTable.refresh()
            })
          }
        },
        {
          id: 1,
          text: this.$t('buttonUpload'),
          variant: 'outline-success',
          icon: 'mdi mdi-18px mdi-upload',
          callback: (selectedIds) => console.log('upload')
        }
      ]
    }
  },
  computed: {
    userCanEdit: function () {
      return this.token && this.group && (this.group.userId === this.token.id)
    }
  },
  watch: {
    token: function (oldValue, newValue) {
      this.group = null
      this.groupId = null
    }
  },
  components: {
    GermplasmTable,
    GroupsTable,
    GroupEditAddModal,
    LocationsTable,
    MarkerTable
  },
  methods: {
    getGermplasmData: function (data, callback) {
      return this.apiPostGermplasmGroupTable(this.group.groupId, data, callback)
    },
    getGermplasmIds: function (data, callback) {
      return this.apiPostGermplasmGroupTableIds(this.group.groupId, data, callback)
    },
    getMarkerData: function (data, callback) {
      return this.apiPostMarkerGroupTable(this.group.groupId, data, callback)
    },
    getMarkerIds: function (data, callback) {
      return this.apiPostMarkerGroupTableIds(this.group.groupId, data, callback)
    },
    getLocationData: function (data, callback) {
      return this.apiPostLocationGroupTable(this.group.groupId, data, callback)
    },
    getLocationIds: function (data, callback) {
      return this.apiPostLocationGroupTableIds(this.group.groupId, data, callback)
    },
    onEditGroup: function () {
      var group = {
        id: this.groupToEdit.groupId,
        name: this.groupToEdit.groupName,
        description: this.groupToEdit.groupDescription
      }
      // Remove empty descriptions
      if (!group.description) {
        delete group.description
      }
      this.apiPatchGroup(group, result => {
        this.$refs.groupsTable.refresh()
      })
    },
    onGroupEditClicked: function (groupToEdit) {
      this.groupToEdit = groupToEdit

      this.$nextTick(() => this.$refs.groupDetailsModal.show())
    },
    onUpdateGroupVisibility: function () {
      this.$nextTick(() => {
        const group = {
          id: this.group.groupId,
          visibility: this.group.groupVisibility
        }
        this.apiPatchGroup(group, result => {
          this.$refs.groupsTable.refresh()
        })
      })
    },
    onGroupDeleteClicked: function (groupToDelete) {
      this.apiDeleteGroup(groupToDelete.groupid, result => {
        // If the current group was deleted, unset selection
        if (this.group && groupToDelete.groupid === this.group.groupId) {
          this.group = null
          this.groupId = null
        }
        // Refresh the table
        this.$refs.groupsTable.refresh()
      })
    },
    onGroupSelected: function (groupId) {
      this.groupId = groupId

      if (this.groupId) {
        var queryParams = {
          page: 1,
          limit: 1,
          prevCount: -1,
          filter: [{
            column: 'groupId',
            comparator: 'equals',
            operator: 'and',
            values: [this.groupId]
          }]
        }
        var prevGroupType = this.group ? this.group.groupType : null
        this.apiPostGroupTable(queryParams, result => {
          if (result && result.data && result.data.length > 0) {
            window.history.replaceState({}, null, `#/groups/${this.groupId}`)
            this.group = result.data[0]

            // This refresh is necessary, since we're not switching group type. The table showing the resulting group
            // is therefore already visible and needs to be told that the group it's showing data for changed.
            if (prevGroupType === this.group.groupType) {
              this.$nextTick(() => this.$refs.groupmembersTable.refresh())
            }
          }
        })
      }
    }
  },
  mounted: function () {
    this.apiGetGroupTypes(result => {
      this.groupTypeSelect = result.data.map(g => {
        return {
          value: g.id,
          text: this.groupTypes[g.targetTable].text()
        }
      })
    })

    this.onGroupSelected(this.$route.params.groupId)
  }
}
</script>

<style>

</style>