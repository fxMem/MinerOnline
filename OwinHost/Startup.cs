using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;
using PlainValley.Messaging;
using PlainValley.Messaging.SignalR;
using PlainValley.Games;
using MinerCore;
using Nancy;
using System.Collections.Generic;
using PlainValley.Games.Actions;
using PlainValley.Messaging.SignalR.Admin;
using PlainValley.Messaging.Metadata;


[assembly: OwinStartup(typeof(OwinHost.Startup))]

namespace OwinHost
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var resolver = new DefaultDependencyResolver();
			resolver.RegisterInSingletoneScope<IGameConfigurationLoader>(() => new MinerGameConfigurationLoader());

			var bootstrapper = new GamesBootstrapper(resolver).
				AddModules(typeof(AdminHttpModule), typeof(LoggerModule)).
				UseLobby().
				RunGames().
				AddAllActions().
				UseMetadataGenerators(typeof(JavaScriptMetadataGenerator)).
				UseMembership(MembershipOptions.Free);

            app.MapGame(bootstrapper).UseNancy();
        }

        private void configure(IDependencyResolver resolver)
        {
            var p = new FieldTile();
            // Регистрирует типы неободимые для работы PlainValley.Games
            ResolverRegistration.Register(resolver);
            var credientialsBinder = resolver.Resolve<IDataBinder>();
            credientialsBinder.RegisterType(typeof(FreeUserCredentials));

            
            resolver.RegisterInSingletoneScope<IGameConfigurationLoader>(() => new MinerGameConfigurationLoader());

            var actions = new List<Func<IDependencyResolver, IAction>>
            {
                (r) => new GameStartVoteAction(r),
                (r) => new MinerCommadAction()
            };
			
            resolver.RegisterInSingletoneScope<IAction>(actions);

        }
    }
}
