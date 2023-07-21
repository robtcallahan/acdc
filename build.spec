
# notes:
#
#  If the first argument to %pre and %post is 1, the action is an initial installation.
#  If the first argument to %pre and %post is 2, the action is an upgrade
#
#  %pre and %post aren't executed during an uninstallation
#  If the first argument to %preun and %postun is 1, the action is an upgrade.
#  If the first argument to %preun and %postun is 0, the action is uninstallation.
#

# define the target os so that I can build on my Mac and install on RedHat or CentOS
%define _target_os linux

# define the installation directory
%define toplevel_dir /var/www/html
%define install_target %{toplevel_dir}/%{name}

# doc_root will get a pointer to the install target 
%define doc_root /var/www/html

# cron files get installed here
%define cron_dir /etc/cron.d

# enable cron jobs on what host?
#%define enable_cron_jobs dev
#%define enable_cron_jobs qa
%define enable_cron_jobs prod

# http config files get installed here
%define http_conf_dir /etc/httpd/conf.d

# main definitions here
Summary:   %{summary}
Name:      %{name}
Version:   %{version}
Release:   %{release}
#BuildRoot: %{_topdir}/buildroot
%define buildroot %{_topdir}/buildroot
BuildArch: noarch
License:   Neustar/Restricted
Group:     Neustar/STS
Requires:  sts-lib

# RPM_BUILD_DIR = pkg/rpmbuild/BUILD
# RPM_BUILD_ROOT = pkg/rpmbuild/buildroot


################################################################################
%description
%{summary}


################################################################################
%prep

################################################################################
%install

export RPM_BUILD_DIR=`pwd`

# create build root
mkdir -p $RPM_BUILD_ROOT/%{install_target}

# copy files to build root
cp -R * $RPM_BUILD_ROOT/%{install_target}

# Tag the release and version info into the ABOUT file
echo 'Version %{version} "%{release_name}"' > $RPM_BUILD_ROOT/%{install_target}/ABOUT

# install the cron jobs
mkdir -p $RPM_BUILD_ROOT/%{cron_dir}
cp $RPM_BUILD_DIR/%{cron_dir}/acdc_weekly_report $RPM_BUILD_ROOT/%{cron_dir}/acdc_weekly_report

# install the vhost conf file
mkdir -p $RPM_BUILD_ROOT/%{http_conf_dir}
cp $RPM_BUILD_DIR/config/vhost.conf $RPM_BUILD_ROOT/%{http_conf_dir}/vhost-%{name}.conf

# create the other directories
mkdir $RPM_BUILD_ROOT/%{toplevel_dir}/%{name}/log
mkdir $RPM_BUILD_ROOT/%{toplevel_dir}/%{name}/data
mkdir $RPM_BUILD_ROOT/%{toplevel_dir}/%{name}/export


################################################################################
%clean
rm -rf $RPM_BUILD_ROOT


################################################################################
%pre
if [ -n "$1" ]; then
    if [ $1 -eq 1 ]; then
        # initial install action here
        echo "Executing pre install actions"
    elif [ $1 -eq 2 ]; then
        # upgrade action here
        echo "Executing pre upgrade actions"
    fi
fi


################################################################################
%post
if [ -n "$1" ]; then
    if [ $1 -eq 1 ]; then
        # initial install action here
        echo "Executing post install actions"
    elif [ $1 -eq 2 ]; then
        # upgrade action here
        echo "Executing post upgrade actions"
    fi
fi

# create a sym link to /opt
if [ ! -h %{doc_root}/%{name} ]; then
    ln -s %{install_target} %{doc_root}
fi

# create a sym link to ext
if [ ! -h %{install_target}/ext ]; then
    ln -s %{doc_root}/ext %{install_target}
fi

# change file permissions
chown -R stsapps.stsapps %{install_target}/log
chown -R stsapps.stsapps %{install_target}/data

find %{install_target} -type d -exec chmod 755 {} \;
find %{install_target} -type f -exec chmod 644 {} \;

# update the vhost file based upon what VM we're being installed on
hostname=`/bin/hostname -s`
if [ $hostname == "stopcdvvt3" ]; then
    domain="dev.tools.ops.neustar.biz"
elif [ $hostname == "stopcqavt2" ]; then
    domain="qa.tools.ops.neustar.biz"
elif [ $hostname == "chopcprvt2" ]; then
    domain="ops.neustar.biz"
else
    domain="dev.tools.ops.neustar.biz"
fi
echo "Updating the vhost file for domain ${domain}..."
cat %{install_target}/config/vhost.conf | \
    sed -e "s/ServerName server_name/ServerName %{name}.${domain}/"  | \
    sed -e "s/name/%{name}/" > /tmp/vhost.conf
install -m 644 /tmp/vhost.conf %{http_conf_dir}/vhost-%{name}.conf
rm -f /tmp/vhost.conf

# enable the cron jobs
update=0
if [ %{enable_cron_jobs} == "dev" -a $hostname == "stopcdvvt3" ]; then
    update=1
elif [ %{enable_cron_jobs} == "dev" -a $hostname == "stopcdvvt1" ]; then
    update=1
elif [ %{enable_cron_jobs} == "qa" -a $hostname == "stopcqavt2" ]; then
    update=1
elif [ %{enable_cron_jobs} == "qa" -a $hostname == "stopcqavt1" ]; then
    update=1
elif [ %{enable_cron_jobs} == "prod" -a $hostname == "chopcprvt2" ]; then
    update=1
elif [ %{enable_cron_jobs} == "prod" -a $hostname == "chtlcprvt1" ]; then
    update=1
fi

if [ $update -eq 1 ]; then
    echo "Updating the config file to enable cron jobs..."
    cp %{install_target}/config/config.php %{install_target}/config/config.php.rpm
    cat %{install_target}/config/config.php | sed -r 's/([ \t]*"runCronJobs"[ \t]*=> )false,/\1true,/' >/tmp/config.php
    install -m 644 /tmp/config.php %{install_target}/config/config.php
    rm -f /tmp/config.php %{install_target}/config/t
fi

# dump the dev database in prep for loading into local db
#echo "Dumping the acdc QA database..."
#/usr/bin/mysqldump \
#    --user=root \
#    --password=xxxxx \
#    --host=stopcqavt2.va.neustar.com \
#    --add-drop-database \
#    --add-drop-table \
#    --complete-insert \
#    --databases %{name} \
#    > /tmp/%{name}_dev.sql

# load the base database (only for initial install)
#echo "Loading the ACDC database..."
#mysql --user=root --password=Shut1tDown < %{install_target}/sql/acdc-base.sql

# clean up unnecessary files
if [ -e %{install_target}/build.xml ]; then
    rm -f %{install_target}/build.xml
fi
if [ -e %{install_target}/%{name}.spec ]; then
    rm -f %{install_target}/build.spec
fi

# restart Apache
#/etc/init.d/httpd restart


################################################################################
%verifyscript


################################################################################
%preun

# do we have a non-empty param 1?
if [ -n "$1" ]; then
    # yep, check the value
    if [ $1 -eq 0 ]; then
        # uninstall action here
        echo "Executing preun uninstall actions"
    elif [ $1 -eq 1 ]; then
        # upgrade action here
        echo "Executing preun upgrade actions"
    fi
fi


################################################################################
%postun
if [ -n "$1" ]; then
    if [ $1 -eq 0 ]; then
        # uninstall action here
        echo "Executing postun uninstall actions"

        # remove the link from /var/www/html
        rm -f /var/www/html/acdc

        # remove whatever is left in /opt/acdc
        rm -rf /opt/acdc

        # remove the vhost file
        rm -f /etc/httpd/conf.d/vhost-acdc.conf

        # restart Apache
        /etc/init.d/httpd restart

        # remove the database
        mysql --user=root --password=Shut1tDown <<EOF
        DROP DATABASE acdc;
EOF

    elif [ $1 -eq 1 ]; then
        # upgrade action here
        echo "Executing postun upgrade actions"
    fi
fi


################################################################################
%files
%defattr(-,root,root,-)

%{install_target}
%{cron_dir}/*

%attr(755,root,root) %{install_target}/bin/*
%attr(644,root,root) %{http_conf_dir}/vhost-%{name}.conf

%dir %attr(755,stsapps,stsapps) %{install_target}/log
%dir %attr(755,stsapps,stsapps) %{install_target}/data
%dir %attr(755,apache,apache) %{install_target}/export

