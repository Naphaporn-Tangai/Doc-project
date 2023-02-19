import datatables from 'datatables.net';
import datatables_bs from 'datatables.net-bs';
import jszip from 'jszip'
import datatables_buttons from 'datatables.net-buttons';
import dt_html5 from 'datatables.net-buttons/js/buttons.html5.min.js';
import dt_boostrap from 'datatables.net-buttons/js/buttons.boostrap.min.js';
import pdfmake from 'datatables.net-buttons/js/pdfmake.min.js';
import vfonts from 'datatables.net-buttons/js/vfs_fonts.js';
import dt_print from 'datatables.net-buttons/js/buttons.print.min.js';
import 'datatables.net-bs/css/dataTables.bootstrap.css'
import 'datatables.net-buttons-dt/css/buttons.dataTables.css'
Template.hpcapprovehistoryhosp.onCreated(function init() {

    $('body').addClass('waitMe_body');
    var elem = $('<div class="waitMe_container img"><div style="background:url(\'img.svg\')"></div></div>');
    $('body').prepend(elem);
})
Template.hpcapprovehistoryhosp.onRendered(function () {
    Session.set('zoneViewProfileCM', null)
    datatables(window, $);
    datatables_bs(window, $);
    // datatables_buttons(window, $);
    dt_html5(window, $, jszip, pdfmake, vfonts);
    dt_boostrap(window, $, jszip, pdfmake, vfonts);
    dt_print(window, $);
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    refreshfunc(Session.get('user').ZONE)

});

Template.hpcapprovehistoryhosp.helpers({
    user() {
        return Session.get('user').NAME
    },
    list() {
        return Session.get('getZonelistCMSecondaryHosp')
    },
    count() {
        if (Session.get('getZonelistCMSecondaryHosp')) {
            return Session.get('getZonelistCMSecondaryHosp').length;
        }
    },
    profile() {
        if (Session.get('zoneApproveViewProfileCM')) {
            return Session.get('zoneApproveViewProfileCM')[0];
        }
    },
    listCompany() {
        if (Session.get('getListSecondaryHosp')) {
            return Session.get('getListSecondaryHosp')
        }
    }
})

Template.hpcapprovehistoryhosp.events({
    'click #cancel'() {
        var arr = Session.get('getListSecondaryHosp')
        if (arr.length != 0) {
            for (var i = 0; i < arr.length; i++) {
                if (JSON.stringify(this) == JSON.stringify(arr[i])) {
                    arr[i].approve = '2'
                    arr[i].approveAt = new Date()
                }
            }
            Session.set('getListSecondaryHosp', arr)
        }
        // toastr.warning("ไม่อนุมัติเรียบร้อย", "สำเร็จ");
    },
    'click #check'() {

        var arr = Session.get('getListSecondaryHosp')
        if (arr.length != 0) {
            for (var i = 0; i < arr.length; i++) {
                if (JSON.stringify(this) == JSON.stringify(arr[i])) {
                    arr[i].approve = '1'
                    arr[i].approveAt = new Date()
                }
            }
            Session.set('getListSecondaryHosp', arr)
        }
        // Session.set('invokeHelpers', Math.random())
        // Meteor.call('getZonelistApproveCM', Session.get('user').ZONE, function (error, result) {
        //     Session.set('getZonelistCMSecondaryHosp', result)
        // });
        //  toastr.success("อนุมัติเรียบร้อย", "สำเร็จ");

    },
    'change .remark'() {
        var arr = Session.get('getListSecondaryHosp')
        var fullcode = this.CODE;
        var text = $('#remark_' + fullcode).val();
        if (arr.length != 0) {
            for (var i = 0; i < arr.length; i++) {
                if (JSON.stringify(this) == JSON.stringify(arr[i])) {
                    arr[i].remark = text

                }
            }
            Session.set('getListSecondaryHosp', arr)
        }
    },
    // 'click #remove'() {

    //     if (confirm('ต้องการลบข้อมูลหรือไม่')) {
    //         const sw = { status: false, code: "" }
    //         const comp = []

    //         Meteor.call('removeHistoryHosp', this._id, comp, sw, function (err, res) {
    //             if (err) throw err;
    //             toastr.success("บันทึกสำเร็จ");
    //             $('#mytable').DataTable().destroy();
    //             refreshfunc(Session.get('user').ZONE)
    //             $('#listapprove').modal('hide');
    //         })
    //     }

    // },
    'click #save'() {
        //console.log(Session.get('zoneApproveViewProfileCM'));
                

        if (Session.get('zoneApproveViewProfileCM')) {
            var idcm = Session.get('zoneApproveViewProfileCM')[0]._id
            var comp = Session.get('getListSecondaryHosp')
            //console.log(idcm);
            //console.log(comp);
            //console.log(comp[comp.length-1]);
            var code_ = comp[comp.length-1].CODE
            //console.log(code_);
            sw = { status: false, code: "" }

            if(code_.length == 5){
                Meteor.call('getAllServiceCenterDistrict', code_, function (err, data) {
                    //console.log(data);
                    var hospcode = data.hospcode
                    var name = data.name
                    var province = data.province
                    var amphoe = data.amphoe
                    var district = data.district
                    var zone = data.zone;
                    //console.log(zone);

                if(comp[comp.length-1].approve == 1){
                    Meteor.call('upDateCMserviceCenter', idcm, hospcode, name, district, amphoe, province, zone, function (error, result) {
                        //console.log('upDateCMserviceCenter');
    
                        Meteor.call('removeHistoryHosp', idcm, comp, sw, function (err, res) {
                            if (err) throw err;
                            toastr.success("บันทึกสำเร็จ");
                            $('#mytable').DataTable().destroy();
                            refreshfunc(Session.get('user').ZONE)
                            $('#listapprove').modal('hide');
                        })
                    });
                }else{
                    Meteor.call('removeHistoryHosp', idcm, comp, sw, function (err, res) {
                        if (err) throw err;
                        toastr.success("บันทึกสำเร็จ");
                        $('#mytable').DataTable().destroy();
                        refreshfunc(Session.get('user').ZONE)
                        $('#listapprove').modal('hide');
                    })
                }
              
            })
            }else if(code_.length == 7){
                
                Meteor.call('getDLA_NAME', code_, function (err, res) {
                    //console.log(res);
                    var hospcode = res.DLA_CODE
                    var name = res.DLA_NAME
                    var province = res.PROVINCE
                    var district = res.DISTRICT
                    var tambon = res.TAMBON
                    
                    Meteor.call('getZoneByDLA', province, function (error, zone) {
                        //console.log(zone);
                        
                        if(comp[comp.length-1].approve == 1){
                            Meteor.call('upDateCM_DLA', idcm, hospcode, name, tambon, district, province, zone, function (error, result) {
                                //console.log('upDateCM_DLA');
    
                                Meteor.call('removeHistoryHosp', idcm, comp, sw, function (err, res) {
                                    if (err) throw err;
                                    toastr.success("บันทึกสำเร็จ");
                                    $('#mytable').DataTable().destroy();
                                    refreshfunc(Session.get('user').ZONE)
                                    $('#listapprove').modal('hide');
                                })
                            });
                        }else{
                            Meteor.call('removeHistoryHosp', idcm, comp, sw, function (err, res) {
                                if (err) throw err;
                                toastr.success("บันทึกสำเร็จ");
                                $('#mytable').DataTable().destroy();
                                refreshfunc(Session.get('user').ZONE)
                                $('#listapprove').modal('hide');
                            })
                        }
                    })
                    
                   
                })
            }else{
                toastr.error('เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง')
            }
            
        } else {
            toastr.error('เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง')
        }

    },
    'click #approveall'() {

        var arr = Session.get('getListSecondaryHosp')
        if (arr.length != 0) {
            _.each(arr, function (x) {
                x.approve = '1'
                x.approveAt = new Date()
            })
            Session.set('getListSecondaryHosp', arr)
        }

    },
    'click #rejectall'() {

        var arr = Session.get('getListSecondaryHosp')
        if (arr.length != 0) {
            _.each(arr, function (x) {
                x.approve = '2'
                x.approveAt = new Date()
            })
            Session.set('getListSecondaryHosp', arr)
        }

    },
    "click #viewcm"() {
        var cid = this._id
        Meteor.call('getLoginUserCM', cid, function (error, result) {
            Session.set('zoneApproveViewProfileCM', result);

        });
    },
    "click #approve"() {
        var cid = this._id
        //console.log(cid);
        
        Meteor.call('getLoginUserCM', cid, function (error, result) {
            Session.set('getListSecondaryHosp', result[0].HISTORY_COMP);
            Session.set('zoneApproveViewProfileCM', result);

        });
    },
    "click #printcm"() {
        if (Session.get('zoneApproveViewProfileCM')) {
            Session.set('zoneViewProfileCM', Session.get('zoneApproveViewProfileCM'))
            $('#cmprofile').modal('hide');
            setTimeout(() => {
                Router.go('/printprofilecm')
            }, 1000);
        } else {
            toastr.error("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง", "ไม่สำเร็จ");
        }
    },
})


function refreshfunc(ZONE) {
    Meteor.call('getZonelistHistoryHosp', ZONE, function (error, result) {
        Session.set('getZonelistCMSecondaryHosp', result)
        setTimeout(function () {
            $('#mytable').DataTable({

                "ordering": false,
                dom: 'lTfgitp',
                lengthChange: false,
                "info": false,
                "language": {
                    "lengthMenu": "แสดง _MENU_ ชุดต่อหน้า",
                    "zeroRecords": "ไม่พบผลลัพธ์",
                    "info": "หน้าที่ _PAGE_ จาก _PAGES_ หน้า",
                    "infoEmpty": "ไม่พบข้อมูล",
                    "loadingRecords": "กำลังโหลด...",
                    "processing": "กำลังประมวลผล...",
                    "search": "ค้นหา : ",
                    "paginate": {
                        "next": "ถัดไป",
                        "previous": "ก่อนหน้า"
                    }
                }
            });
            $('body.waitMe_body').addClass('hideMe');
            $('body.waitMe_body').find('.waitMe_container:not([data-waitme_id])').remove();
            $('body.waitMe_body').removeClass('waitMe_body hideMe');
        }, 500)

    });
}

Template.registerHelper('SECONDARY_HOSP_STATUS', function (data) {
    if (data) {
        return data == '0' ? Spacebars.SafeString("<label style='color:orange;font-weight:bold'>รอการอนุมัติ</label>") : data == '1' ? Spacebars.SafeString("<label style='color:limegreen;font-weight:bold'>อนุมัติแล้ว</label>") : Spacebars.SafeString("<label style='color:red;font-weight:bold'>ไม่อนุมัติ</label>")
    }
});

Template.registerHelper('SECONDARY_CHECK_STATUS', function (data) {
    if (data == '0') {
        return 'block'
    }else if(data == '1'){
        return 'none'
    }else if(data == '2'){
        return 'none'
    }else{
        return 'none'
    }
});

Template.registerHelper('CHECK_SECONDARY_WAIT', function (data) {
    var count = 0
    if (data.length != 0) {
        _.each(data, function (x) {
            if (x.approve == '0') {
                count++
            }
        })
        return count
    }
});
Template.registerHelper('CHECK_SECONDARY_APPROVE', function (data) {
    var count = 0
    if (data.length != 0) {
        _.each(data, function (x) {
            if (x.approve == '1') {
                count++
            }
        })
        return count
    }
});
Template.registerHelper('CHECK_SECONDARY_REJECT', function (data) {
    var count = 0
    if (data.length != 0) {
        _.each(data, function (x) {
            if (x.approve == '2') {
                count++
            }
        })
        return count
    }
});